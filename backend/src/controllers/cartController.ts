import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { cartItemSchema, updateCartItemSchema } from '../validators/index.js';
import { calculateAuthoritativePricing } from '../services/pricingService.js';

function getCartQuery(req: AuthRequest) {
  if (req.user) {
    return { user: req.user._id };
  }
  const guestSessionId = (req.headers['x-guest-session-id'] as string) || req.query.guestSessionId;
  return guestSessionId ? { guestSessionId } : null;
}

export async function getCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = getCartQuery(req);
    if (!query) {
      res.status(200).json({
        success: true,
        data: { items: [], pricing: { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, total: 0 } },
      });
      return;
    }

    let cart = await Cart.findOne(query).populate('items.product');
    if (!cart) {
      res.status(200).json({
        success: true,
        data: { items: [], pricing: { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, total: 0 } },
      });
      return;
    }

    // Filter out deleted products or check current stock
    const cartItemsInput = cart.items
      .filter((i) => i.product)
      .map((item) => ({
        productId: (item.product as any)._id.toString(),
        sku: item.sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));

    const couponCode = typeof req.query.coupon === 'string' ? req.query.coupon : undefined;

    let pricing;
    try {
      pricing = await calculateAuthoritativePricing(cartItemsInput, couponCode);
    } catch (pricingError) {
      // If stock issue or coupon issue, compute with no coupon or report error
      pricing = await calculateAuthoritativePricing(cartItemsInput).catch(() => ({
        items: [],
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        tax: 0,
        total: 0,
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        _id: cart._id,
        items: cart.items,
        pricing,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addCartItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = cartItemSchema.parse(req.body);

    const product = await Product.findById(data.productId);
    if (!product || !product.isActive) {
      res.status(404).json({ success: false, message: 'Product not found or inactive.' });
      return;
    }

    const variant = product.variants.find((v) => v.sku === data.sku);
    if (!variant) {
      res.status(400).json({ success: false, message: 'Selected variant does not exist.' });
      return;
    }

    if (variant.stock < data.quantity) {
      res.status(400).json({
        success: false,
        message: `Only ${variant.stock} units available in stock.`,
      });
      return;
    }

    let query = getCartQuery(req);
    let cart;

    if (query) {
      cart = await Cart.findOne(query);
    }

    if (!cart) {
      const guestSessionId =
        (req.headers['x-guest-session-id'] as string) ||
        `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      cart = new Cart({
        user: req.user ? req.user._id : undefined,
        guestSessionId: req.user ? undefined : guestSessionId,
        items: [],
      });
    }

    // Check if variant already in cart
    const existingIndex = cart.items.findIndex((item) => item.sku === data.sku);
    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + data.quantity;
      if (newQty > variant.stock) {
        res.status(400).json({
          success: false,
          message: `Cannot add more. You have ${cart.items[existingIndex].quantity} in cart and available stock is ${variant.stock}.`,
        });
        return;
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: product._id as any,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: data.quantity,
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Product added to bag.',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { itemId } = req.params;
    const { quantity } = updateCartItemSchema.parse(req.body);

    const query = getCartQuery(req);
    if (!query) {
      res.status(400).json({ success: false, message: 'Cart session not found.' });
      return;
    }

    const cart = await Cart.findOne(query).populate('items.product');
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    const item = cart.items.find((i: any) => i._id.toString() === itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found in cart.' });
      return;
    }

    const product = await Product.findById(item.product);
    if (!product) {
      cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);
      await cart.save();
      res.status(400).json({ success: false, message: 'Product is no longer available.' });
      return;
    }

    const variant = product.variants.find((v) => v.sku === item.sku);
    if (!variant || variant.stock < quantity) {
      res.status(400).json({
        success: false,
        message: `Only ${variant ? variant.stock : 0} items available in stock.`,
      });
      return;
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { itemId } = req.params;
    const query = getCartQuery(req);
    if (!query) {
      res.status(400).json({ success: false, message: 'Cart session not found.' });
      return;
    }

    const cart = await Cart.findOne(query);
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Item removed from bag.',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function mergeCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Login required to merge cart.' });
      return;
    }

    const { guestSessionId } = req.body;
    if (!guestSessionId) {
      res.status(200).json({ success: true, message: 'No guest cart to merge.' });
      return;
    }

    const guestCart = await Cart.findOne({ guestSessionId });
    if (!guestCart || guestCart.items.length === 0) {
      res.status(200).json({ success: true, message: 'Guest cart empty.' });
      return;
    }

    let userCart = await Cart.findOne({ user: req.user._id });
    if (!userCart) {
      userCart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    // Merge items
    for (const gItem of guestCart.items) {
      const existing = userCart.items.find((uItem) => uItem.sku === gItem.sku);
      if (existing) {
        existing.quantity += gItem.quantity;
      } else {
        userCart.items.push(gItem);
      }
    }

    await userCart.save();
    await Cart.findByIdAndDelete(guestCart._id);

    await userCart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Guest bag merged successfully.',
      data: userCart,
    });
  } catch (error) {
    next(error);
  }
}
