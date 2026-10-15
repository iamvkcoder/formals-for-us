import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/orders', requireAuth, createOrder);
router.get('/orders', requireAuth, getMyOrders);
router.get('/orders/:id', requireAuth, getOrderById);
router.post('/orders/:id/cancel', requireAuth, cancelOrder);
router.post('/orders/:id/return-request', requireAuth, requestReturn);

export default router;
