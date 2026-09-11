import { Router } from 'express';
import { authenticateCustomer, optionalAuth } from '../middleware/auth.js';
import { checkDeliveryAvailability, getCheckoutShippingRates } from '../controllers/public/shipping.js';

const router = Router();

// Public — no auth required (used on product pages)
router.get('/check', checkDeliveryAvailability);

// Authenticated — used during checkout
router.get('/rates', authenticateCustomer, getCheckoutShippingRates);

export default router;
