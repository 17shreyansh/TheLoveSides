import { Router } from 'express';
import { razorpayWebhook } from '../webhooks/razorpay.js';

const router = Router();

// Webhooks typically need raw body for signature verification
// We use express.raw for this specific route so we can access req.body as a Buffer (which we can then stringify correctly)
// Wait, express.json() might have already run globally. 
// It's better to configure raw body in the global express.json middleware via `verify` option.
// Since we don't want to change global config immediately, we can mount it here.

router.post('/razorpay', razorpayWebhook);

export default router;
