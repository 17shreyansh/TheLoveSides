import { Router } from 'express';
import { authenticateCustomer, optionalAuth } from '../middleware/auth.js';
import { checkDeliveryAvailability, getCheckoutShippingRates, trackByAWB } from '../controllers/public/shipping.js';

const router = Router();

// Public — no auth required (used on product pages)
router.get('/check', checkDeliveryAvailability);

// Authenticated — used during checkout
router.get('/rates', authenticateCustomer, getCheckoutShippingRates);

// Public — track AWB
router.get('/track/:awb', trackByAWB);

export default router;
