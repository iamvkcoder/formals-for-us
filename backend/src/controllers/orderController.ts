import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { Order, OrderStatus } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Address } from '../models/Address.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { checkoutSchema, cancelOrderSchema, returnRequestSchema } from '../validators/index.js';
import { calculateAuthoritativePricing } from '../services/pricingService.js';

export async function createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to checkout' });
      return;
    }

    const data = checkoutSchema.parse(req.body);

    // 1. Fetch user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your shopping bag is empty.' });
      return;
    }

    // 2. Resolve shipping address
    let shippingAddressSnapshot: any;
    if (data.addressId) {
      const address = await Address.findOne({ _id: data.addressId, user: req.user._id });
      if (!address) {
        res.status(404).json({ success: false, message: 'Selected address not found.' });
        return;
      }
      shippingAddressSnapshot = {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };
    } else if (data.shippingAddress) {
      shippingAddressSnapshot = data.shippingAddress;
    }

    // 3. Authoritative Pricing & Inventory Validation
    const cartItemsInput = cart.items.map((item) => ({
      productId: (item.product as any)._id.toString(),
      sku: item.sku,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    }));

    const pricing = await calculateAuthoritativePricing(cartItemsInput, data.couponCode);

    // 4. Atomic inventory deduction
    const deductedItems: { productId: any; sku: string; quantity: number }[] = [];
    try {
      for (const item of pricing.items) {
        const updateResult = await Product.updateOne(
          {
            _id: item.product._id,
            'variants.sku': item.sku,
            'variants.stock': { $gte: item.quantity },
          },
          {
            $inc: {
              'variants.$.stock': -item.quantity,
              salesCount: item.quantity,
            },
          }
        );

        if (updateResult.modifiedCount === 0) {
          throw new Error(
            `Unable to reserve stock for "${item.productName}" (${item.size}, ${item.color}). It may have just sold out.`
          );
        }

        deductedItems.push({
          productId: item.product._id,
          sku: item.sku,
          quantity: item.quantity,
        });
      }
    } catch (stockError) {
      // Rollback any successfully decremented items
      for (const rolled of deductedItems) {
        await Product.updateOne(
          { _id: rolled.productId, 'variants.sku': rolled.sku },
          {
            $inc: {
              'variants.$.stock': rolled.quantity,
              salesCount: -rolled.quantity,
            },
          }
        );
      }
      res.status(400).json({ success: false, message: (stockError as Error).message });
      return;
    }

    // 5. Increment coupon usage if applied
    if (pricing.coupon) {
      await Coupon.findByIdAndUpdate(pricing.coupon._id, { $inc: { usageCount: 1 } });
    }

    // 6. Generate unique formal order number
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `FFU-${new Date().getFullYear()}-${randomHex}`;

    const isSimulatedOnline = data.paymentMethod === 'online_simulated';
    const initialPaymentStatus = data.paymentMethod === 'cod' ? 'pending' : isSimulatedOnline ? 'pending' : 'pending';
    const initialOrderStatus: OrderStatus = 'Confirmed';

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      customerEmail: req.user.email,
      customerName: req.user.name,
      items: pricing.items.map((i) => ({
        product: i.product._id,
        productName: i.productName,
        productImage: i.productImage,
        sku: i.sku,
        size: i.size,
        color: i.color,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
      })),
      shippingAddress: shippingAddressSnapshot,
      pricing: {
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        couponCode: pricing.couponCode,
        shippingFee: pricing.shippingFee,
        tax: pricing.tax,
        total: pricing.total,
      },
      payment: {
        method: data.paymentMethod,
        status: initialPaymentStatus,
        simulated: isSimulatedOnline,
      },
      orderStatus: initialOrderStatus,
      statusHistory: [
        {
          status: initialOrderStatus,
          timestamp: new Date(),
          comment: `Order placed via ${data.paymentMethod.toUpperCase()}`,
        },
      ],
    });

    // 7. Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    // Support lookup by MongoDB _id or by human-readable orderNumber (e.g. FFU-2026-XXXX)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query: any = isObjectId ? { _id: id } : { orderNumber: id };

    // Enforce authorization: user must own order or be admin
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { reason } = cancelOrderSchema.parse(req.body);

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query: any = isObjectId ? { _id: id } : { orderNumber: id };
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (!['Pending', 'Confirmed', 'Processing'].includes(order.orderStatus)) {
      res.status(400).json({
        success: false,
        message: `Orders with status "${order.orderStatus}" cannot be cancelled.`,
      });
      return;
    }

    // Restore inventory
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, 'variants.sku': item.sku },
        {
          $inc: {
            'variants.$.stock': item.quantity,
            salesCount: -item.quantity,
          },
        }
      );
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      comment: `Order cancelled by ${req.user.role === 'admin' ? 'Administrator' : 'Customer'}: ${reason}`,
    });

    if (order.payment.status === 'completed') {
      order.payment.status = 'refunded';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function requestReturn(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { reason } = returnRequestSchema.parse(req.body);

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query: any = isObjectId ? { _id: id } : { orderNumber: id };
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (order.orderStatus !== 'Delivered') {
      res.status(400).json({
        success: false,
        message: 'Returns can only be requested for Delivered orders.',
      });
      return;
    }

    order.orderStatus = 'Return Requested';
    order.returnReason = reason;
    order.statusHistory.push({
      status: 'Return Requested',
      timestamp: new Date(),
      comment: `Return requested by customer: ${reason}`,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Return request submitted. Our executive will inspect and arrange pickup.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
