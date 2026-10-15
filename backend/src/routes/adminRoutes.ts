import { Router } from 'express';
import {
  getAnalytics,
  getAdminOrders,
  updateOrderStatus,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCustomers,
  getLowStockAlerts,
  exportSalesReport,
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes with authentication and role check
router.use(requireAuth, requireAdmin);

router.get('/admin/analytics', getAnalytics);
router.get('/admin/orders', getAdminOrders);
router.patch('/admin/orders/:id/status', updateOrderStatus);
router.get('/admin/products', getAdminProducts);
router.post('/admin/products', createProduct);
router.patch('/admin/products/:id', updateProduct);
router.delete('/admin/products/:id', deleteProduct);
router.get('/admin/customers', getCustomers);
router.get('/admin/inventory/low-stock', getLowStockAlerts);
router.get('/admin/reports/sales', exportSalesReport);

export default router;
