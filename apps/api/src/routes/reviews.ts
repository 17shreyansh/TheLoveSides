import { Router } from 'express';
import { authenticateCustomer } from '../middleware/auth.js';
import { submitReview, getProductReviews } from '../controllers/public/review.js';

const router = Router();

// Publicly accessible for viewing reviews
router.get('/:productId', getProductReviews);

// Protected route for submitting reviews
router.post('/', authenticateCustomer, submitReview);

export default router;
