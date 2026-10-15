import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/wishlist', requireAuth, getWishlist);
router.post('/wishlist/items', requireAuth, addToWishlist);
router.delete('/wishlist/items/:productId', requireAuth, removeFromWishlist);

export default router;
