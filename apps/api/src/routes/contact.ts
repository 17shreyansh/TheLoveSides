import { Router } from 'express';
import { submitLead } from '../controllers/contact.js';

const router = Router();

router.post('/', submitLead);

export default router;
