import { Router } from 'express';
import {
  createPayment,
  verifyPayment,
  simulatedPay,
  paymentWebhook,
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/payments/create', requireAuth, createPayment);
router.post('/payments/verify', requireAuth, verifyPayment);
router.post('/payments/simulated-pay', requireAuth, simulatedPay);
router.post('/payments/webhook', paymentWebhook);

export default router;
