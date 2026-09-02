import { Router } from 'express';
import { authenticateCustomer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getProfile, updateProfile } from '../controllers/public/account.js';
import { listAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/public/address.js';
import { z } from 'zod';

const router = Router();

router.use(authenticateCustomer);

const updateProfileSchema = z.object({
  firstName: z.string().min(1).trim().optional(),
  lastName: z.string().min(1).trim().optional(),
  phone: z.string().min(10).trim().optional(),
});

router.get('/profile', getProfile);
router.patch('/profile', validate({ body: updateProfileSchema }), updateProfile);

router.get('/addresses', listAddresses);
router.post('/addresses', createAddress);
router.patch('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;
