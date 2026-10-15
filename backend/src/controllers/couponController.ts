import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon.js';

export async function validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required' });
      return;
    }

    const subtotal = Number(orderAmount) || 0;
    const cleanCode = code.trim().toUpperCase();

    const coupon = await Coupon.findOne({
      code: cleanCode,
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
      return;
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'This coupon has reached its maximum usage limit' });
      return;
    }

    if (subtotal < coupon.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      });
      return;
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      const discount = Math.round((subtotal * coupon.discountValue) / 100);
      calculatedDiscount = coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
    } else {
      calculatedDiscount = Math.min(coupon.discountValue, subtotal);
    }

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount,
        description: coupon.description,
      },
    });
  } catch (error) {
    next(error);
  }
}
