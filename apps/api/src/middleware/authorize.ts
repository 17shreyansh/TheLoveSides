import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { AdminUser } from '../models/AdminUser.js';

/**
 * Checks if the authenticated admin has ALL of the specified permissions.
 * Must be used AFTER authenticateAdmin middleware.
 *
 * @example
 * router.delete('/products/:id', authenticateAdmin, authorize('products.delete'), deleteProduct);
 */
export function authorize(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        throw ApiError.forbidden('Admin access required');
      }

      // Fetch admin with populated role and permissions
      const admin = await AdminUser.findById(req.user.id)
        .populate<{ role: { name: string; permissions: string[] } }>('role', 'name permissions')
        .lean();

      if (!admin || !admin.role) {
        throw ApiError.forbidden('No role assigned');
      }

      const adminPermissions = admin.role.permissions;

      // SUPER_ADMIN bypasses all permission checks
      if (admin.role.name === 'SUPER_ADMIN') {
        next();
        return;
      }

      // Check if admin has all required permissions
      const hasAllPermissions = requiredPermissions.every(
        (perm) => adminPermissions.includes(perm),
      );

      if (!hasAllPermissions) {
        const missing = requiredPermissions.filter(
          (perm) => !adminPermissions.includes(perm),
        );
        throw ApiError.forbidden(
          `Missing permissions: ${missing.join(', ')}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
