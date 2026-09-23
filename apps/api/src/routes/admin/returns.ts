import { Router } from 'express';
import { authenticateAdmin } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import {
  listReturns,
  getReturnById,
  updateReturnStatus,
} from '../../controllers/admin/return.js';

const router = Router();

router.use(authenticateAdmin);

router.get('/', authorize('orders.read'), listReturns);
router.get('/:id', authorize('orders.read'), getReturnById);
router.patch('/:id/status', authorize('orders.update'), updateReturnStatus);

export default router;
