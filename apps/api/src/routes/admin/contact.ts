import { Router } from 'express';
import { getLeads, updateLeadStatus, deleteLead } from '../../controllers/contact.js';
import { authenticateAdmin } from '../../middleware/auth.js';

const router = Router();

// Protect all admin contact routes
router.use(authenticateAdmin);

router.get('/leads', getLeads);
router.patch('/leads/:id/status', updateLeadStatus);
router.delete('/leads/:id', deleteLead);

export default router;
