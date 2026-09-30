import { Router } from 'express';
import { AdminInstagramController } from '../../controllers/admin/instagram.js';
import { authenticateAdmin } from '../../middleware/auth.js';

const router = Router();

// Require admin authentication
router.use(authenticateAdmin);

router.post('/import', AdminInstagramController.importMedia);
router.get('/', AdminInstagramController.listMedia);
router.post('/reorder', AdminInstagramController.reorderMedia);
router.post('/bulk-publish', AdminInstagramController.bulkPublish);
router.patch('/:id', AdminInstagramController.updateMedia);
router.delete('/:id', AdminInstagramController.deleteMedia);

export default router;
