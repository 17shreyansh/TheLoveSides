import { Router } from 'express';

import { checkDeliveryAvailability, getCheckoutShippingRates, trackByAWB } from '../controllers/public/shipping.js';

const router = Router();

// Public — no auth required (used on product pages)
router.get('/check', checkDeliveryAvailability);

// Public or Guest checkout — used during checkout
router.get('/rates', getCheckoutShippingRates);

// Public — track AWB
router.get('/track/:awb', trackByAWB);

export default router;
