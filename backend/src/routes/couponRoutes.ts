import { Router } from 'express';
import { validateCoupon } from '../controllers/couponController.js';

const router = Router();

router.post('/coupons/validate', validateCoupon);

export default router;
