import { Product, IProduct } from '../models/Product.js';
import { Coupon, ICoupon } from '../models/Coupon.js';
import { ENV } from '../config/env.js';

export interface CartInputItem {
  productId: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
}

export interface ValidatedItem {
  product: IProduct;
  productName: string;
  productImage: string;
  sku: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface PricingBreakdown {
  items: ValidatedItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  coupon?: ICoupon;
}

export async function calculateAuthoritativePricing(
  items: CartInputItem[],
  couponCode?: string
): Promise<PricingBreakdown> {
  if (!items || items.length === 0) {
    return {
      items: [],
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      tax: 0,
      total: 0,
    };
  }

  const validatedItems: ValidatedItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      throw new Error(`Product ${item.productId} is no longer available.`);
    }

    // Find the variant
    const variant = product.variants.find((v) => v.sku === item.sku);
    if (!variant) {
      throw new Error(`Variant ${item.sku} for "${product.name}" not found.`);
    }

    if (variant.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}" (${variant.size}, ${variant.color}). Available: ${variant.stock}, requested: ${item.quantity}.`
      );
    }

    // Determine unit price (salePrice if available, otherwise basePrice) + additionalPrice
    const unitPrice = (product.salePrice ?? product.basePrice) + (variant.additionalPrice || 0);
    const itemTotal = unitPrice * item.quantity;

    subtotal += itemTotal;

    validatedItems.push({
      product,
      productName: product.name,
      productImage: product.images[0] || '',
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      unitPrice,
      quantity: item.quantity,
      totalPrice: itemTotal,
    });
  }

  // Calculate discount from coupon if provided
  let discount = 0;
  let appliedCoupon: ICoupon | undefined;

  if (couponCode) {
    const code = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (coupon) {
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new Error(`Coupon "${code}" has reached its maximum usage limit.`);
      }

      if (subtotal < coupon.minOrderValue) {
        throw new Error(
          `Coupon "${code}" requires a minimum order value of ₹${coupon.minOrderValue}. Current subtotal is ₹${subtotal}.`
        );
      }

      if (coupon.discountType === 'percentage') {
        const calculated = Math.round((subtotal * coupon.discountValue) / 100);
        discount = coupon.maxDiscount ? Math.min(calculated, coupon.maxDiscount) : calculated;
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }

      appliedCoupon = coupon;
    } else {
      throw new Error(`Invalid or expired coupon code: ${couponCode}`);
    }
  }

  // Calculate shipping fee
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shippingFee =
    discountedSubtotal >= ENV.SHIPPING.FREE_THRESHOLD || discountedSubtotal === 0
      ? 0
      : ENV.SHIPPING.STANDARD_FEE;

  // Calculate tax (12% standard apparel GST)
  const taxableAmount = discountedSubtotal;
  const tax = Math.round(taxableAmount * ENV.TAX.RATE);

  const total = discountedSubtotal + shippingFee + tax;

  return {
    items: validatedItems,
    subtotal,
    discount,
    couponCode: appliedCoupon ? appliedCoupon.code : undefined,
    shippingFee,
    tax,
    total,
    coupon: appliedCoupon,
  };
}
