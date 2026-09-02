import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { rateLimitAuth } from '../middleware/rateLimiter.js';
import { authenticateCustomer, authenticateAdmin } from '../middleware/auth.js';
import { 
  customerRegisterSchema, 
  customerLoginSchema, 
  adminLoginSchema 
} from '../validators/auth.js';
import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getMe,
  loginAdmin,
  logoutAdmin,
  getAdminMe,
  refreshCustomerToken,
  refreshAdminToken,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.js';

const router = Router();

// ========================================
// Customer Routes
// ========================================
router.post(
  '/register',
  rateLimitAuth,
  validate({ body: customerRegisterSchema }),
  registerCustomer
);

router.post(
  '/login',
  rateLimitAuth,
  validate({ body: customerLoginSchema }),
  loginCustomer
);

router.post('/logout', logoutCustomer);

router.post('/refresh', rateLimitAuth, refreshCustomerToken);

router.get('/me', authenticateCustomer, getMe);

router.post('/forgot-password', rateLimitAuth, forgotPassword);
router.post('/reset-password', rateLimitAuth, resetPassword);

// ========================================
// Admin Routes
// ========================================
router.post(
  '/admin/login',
  rateLimitAuth,
  validate({ body: adminLoginSchema }),
  loginAdmin
);

router.post('/admin/logout', logoutAdmin);

router.post('/admin/refresh', rateLimitAuth, refreshAdminToken);

router.get('/admin/me', authenticateAdmin, getAdminMe);

export default router;
