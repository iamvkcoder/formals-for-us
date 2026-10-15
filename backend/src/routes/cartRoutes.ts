import { Router } from 'express';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  mergeCart,
} from '../controllers/cartController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/cart', optionalAuth, getCart);
router.post('/cart/items', optionalAuth, addCartItem);
router.patch('/cart/items/:itemId', optionalAuth, updateCartItem);
router.delete('/cart/items/:itemId', optionalAuth, removeCartItem);
router.post('/cart/merge', requireAuth, mergeCart);

export default router;
