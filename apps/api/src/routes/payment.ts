import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { createRazorpayOrder, verifyPayment } from '../controllers/public/payment.js';

const router = Router();

router.use(optionalAuth);

router.post('/:orderId/initiate', createRazorpayOrder);
router.post('/:orderId/verify', verifyPayment);

export default router;
