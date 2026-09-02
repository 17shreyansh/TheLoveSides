import { Router } from 'express';
import { authenticateAdmin } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { listReviews, updateReviewStatus } from '../../controllers/admin/review.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

router.use(authenticateAdmin);

const updateReviewSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'hidden'])
});

router.get('/', authorize('reviews.read'), listReviews);
router.patch('/:id/status', authorize('reviews.update'), validate({ body: updateReviewSchema }), updateReviewStatus);

export default router;
