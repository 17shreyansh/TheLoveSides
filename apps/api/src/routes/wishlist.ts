import { Router } from 'express';
import { authenticateCustomer } from '../middleware/auth.js';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/public/wishlist.js';

const router = Router();

router.use(authenticateCustomer);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
