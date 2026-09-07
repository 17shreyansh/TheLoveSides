import { Router } from 'express';
import { getPageBySlug } from '../controllers/public/pages.js';

const router = Router();

router.get('/:slug', getPageBySlug);

export default router;
