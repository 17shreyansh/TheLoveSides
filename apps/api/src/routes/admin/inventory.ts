import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticateAdmin } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { adjustInventory, getInventoryHistory } from '../../controllers/admin/inventory.js';
import { adjustInventorySchema } from '../../validators/inventory.js';

const router = Router();

router.use(authenticateAdmin);

router.post(
  '/:variantId/adjust',
  authorize('inventory.adjust'),
  validate({ body: adjustInventorySchema }),
  adjustInventory
);

router.get(
  '/:variantId/history',
  authorize('inventory.read'),
  getInventoryHistory
);

export default router;
