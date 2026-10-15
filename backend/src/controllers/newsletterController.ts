import { Request, Response, NextFunction } from 'express';
import { Newsletter } from '../models/Newsletter.js';
import { newsletterSchema } from '../validators/index.js';

export async function subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = newsletterSchema.parse(req.body);

    await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), isActive: true },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Thank you for subscribing to FORMALS FOR US editorial releases.',
    });
  } catch (error) {
    next(error);
  }
}
