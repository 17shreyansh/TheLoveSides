import { Router } from 'express';
import { authenticateAdmin } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';

import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../controllers/admin/coupon.js';
import { listReturns, getReturnById, updateReturnStatus } from '../../controllers/admin/return.js';
import { listReviews, updateReviewStatus } from '../../controllers/admin/review.js';
import { listCmsPages, getCmsPageById, createCmsPage, updateCmsPage, deleteCmsPage } from '../../controllers/admin/cms.js';
import { listMedia, createMediaRecord, deleteMedia } from '../../controllers/admin/media.js';
import { listAuditLogs, getAuditLogById } from '../../controllers/admin/audit.js';
import { listSettings, updateSettings } from '../../controllers/admin/setting.js';
import { listAdminUsers, createAdminUser, updateAdminUser } from '../../controllers/admin/users.js';

const router = Router();

router.use(authenticateAdmin);

// ========================================
// Coupons
// ========================================
router.get('/coupons', authorize('marketing.read'), listCoupons);
router.post('/coupons', authorize('marketing.write'), createCoupon);
router.patch('/coupons/:id', authorize('marketing.write'), updateCoupon);
router.delete('/coupons/:id', authorize('marketing.delete'), deleteCoupon);

// ========================================
// Returns
// ========================================
router.get('/returns', authorize('orders.read'), listReturns);
router.get('/returns/:id', authorize('orders.read'), getReturnById);
router.patch('/returns/:id/status', authorize('orders.update'), updateReturnStatus);

// ========================================
// Reviews
// ========================================
router.get('/reviews', authorize('catalog.read'), listReviews);
router.patch('/reviews/:id/status', authorize('catalog.update'), updateReviewStatus);

// ========================================
// CMS Pages
// ========================================
router.get('/cms', authorize('cms.read'), listCmsPages);
router.get('/cms/:id', authorize('cms.read'), getCmsPageById);
router.post('/cms', authorize('cms.write'), createCmsPage);
router.patch('/cms/:id', authorize('cms.write'), updateCmsPage);
router.delete('/cms/:id', authorize('cms.write'), deleteCmsPage);

// ========================================
// Media
// ========================================
router.get('/media', authorize('media.read'), listMedia);
router.post('/media', authorize('media.upload'), createMediaRecord);
router.delete('/media/:id', authorize('media.delete'), deleteMedia);

// ========================================
// Audit Logs
// ========================================
router.get('/audit-logs', authorize('settings.read'), listAuditLogs);
router.get('/audit-logs/:id', authorize('settings.read'), getAuditLogById);

// ========================================
// Settings
// ========================================
router.get('/settings', authorize('settings.read'), listSettings);
router.patch('/settings', authorize('settings.write'), updateSettings);

// ========================================
// Admin Users
// ========================================
router.get('/users', authorize('settings.read'), listAdminUsers);
router.post('/users', authorize('settings.write'), createAdminUser);
router.patch('/users/:id', authorize('settings.write'), updateAdminUser);

export default router;
