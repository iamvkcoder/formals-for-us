import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Address } from '../models/Address.js';
import { addressSchema } from '../validators/index.js';

export async function getAddresses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
}

export async function addAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const data = addressSchema.parse(req.body);

    // If marked as default, unset other defaults
    if (data.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    } else {
      // If user has no existing addresses, make this first one default
      const count = await Address.countDocuments({ user: req.user._id });
      if (count === 0) {
        data.isDefault = true;
      }
    }

    const address = await Address.create({
      ...data,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const data = addressSchema.parse(req.body);

    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    if (data.isDefault && !address.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, data);
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
