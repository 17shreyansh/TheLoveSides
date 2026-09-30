import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { 
  otpSendLimiter, 
  otpVerifyLimiter, 
  adminLoginLimiter, 
  refreshCustomerLimiter,
  refreshAdminLimiter,
  passwordResetLimiter
} from '../middleware/rateLimit/index.js';
import { authenticateCustomer, authenticateAdmin } from '../middleware/auth.js';
import { 
  requestOtpSchema, 
  verifyOtpSchema, 
  adminLoginSchema,
  changeAdminPasswordSchema
} from '../validators/auth.js';
import {
  requestOtp,
  verifyOtp,
  logoutCustomer,
  getMe,
  loginAdmin,
  logoutAdmin,
  getAdminMe,
  refreshCustomerToken,
  refreshAdminToken,
  forgotPassword,
  resetPassword,
  changeAdminPassword,
} from '../controllers/auth.js';

const router = Router();

// ========================================
// Customer Routes
// ========================================
router.post(
  '/request-otp',
  otpSendLimiter,
  validate({ body: requestOtpSchema }),
  requestOtp
);

router.post(
  '/verify-otp',
  otpVerifyLimiter,
  validate({ body: verifyOtpSchema }),
  verifyOtp
);

router.post('/logout', logoutCustomer);

router.post('/refresh', refreshCustomerLimiter, refreshCustomerToken);

router.get('/me', authenticateCustomer, getMe);

router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

// ========================================
// Admin Routes
// ========================================
router.post(
  '/admin/login',
  adminLoginLimiter,
  validate({ body: adminLoginSchema }),
  loginAdmin
);

router.post('/admin/logout', logoutAdmin);

router.post('/admin/refresh', refreshAdminLimiter, refreshAdminToken);

router.get('/admin/me', authenticateAdmin, getAdminMe);

router.put(
  '/admin/password',
  authenticateAdmin,
  validate({ body: changeAdminPasswordSchema }),
  changeAdminPassword
);

export default router;
