import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getCategories,
  getSearchSuggestions,
} from '../controllers/productController.js';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.get('/products/:id/related', getRelatedProducts);
router.get('/categories', getCategories);
router.get('/search/suggestions', getSearchSuggestions);

export default router;
