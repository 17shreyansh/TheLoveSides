import { Router } from 'express';
import { getPublicSettings } from '../controllers/setting.js';

const router = Router();

router.get('/', getPublicSettings);

export default router;
