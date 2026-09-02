import { Router } from 'express';
import { authenticateCustomer } from '../middleware/auth.js';
import { getMyOrders, getMyOrderById, cancelMyOrder } from '../controllers/public/order.js';
import { requestReturn } from '../controllers/public/return.js';

const router = Router();

router.use(authenticateCustomer);

router.get('/', getMyOrders);
router.get('/:id', getMyOrderById);
router.post('/:id/cancel', cancelMyOrder);
router.post('/:orderId/return', requestReturn);

export default router;
