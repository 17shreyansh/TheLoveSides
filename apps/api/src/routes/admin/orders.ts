import { Router } from 'express';
import { authenticateAdmin } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import {
  listOrders,
  getOrderById,
  updateOrderStatus,
  adminCancelOrder,
  addOrderNote,
  getDashboardStats,
  createShipment,
} from '../../controllers/admin/order.js';
import { listCustomers, getCustomerById } from '../../controllers/admin/customer.js';

const router = Router();

router.use(authenticateAdmin);

// ========================================
// Dashboard
// ========================================
router.get('/dashboard/stats', authorize('orders.read'), getDashboardStats);

// ========================================
// Orders
// ========================================
router.get('/orders', authorize('orders.read'), listOrders);
router.get('/orders/:id', authorize('orders.read'), getOrderById);
router.patch('/orders/:id/status', authorize('orders.update'), updateOrderStatus);
router.post('/orders/:id/cancel', authorize('orders.cancel'), adminCancelOrder);
router.patch('/orders/:id/notes', authorize('orders.update'), addOrderNote);
router.post('/orders/:id/shipment', authorize('orders.update'), createShipment);

// ========================================
// Customers
// ========================================
router.get('/customers', authorize('customers.read'), listCustomers);
router.get('/customers/:id', authorize('customers.read'), getCustomerById);

export default router;
