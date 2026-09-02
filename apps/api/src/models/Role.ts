import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean; // System roles cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: { type: String, trim: true },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Role = mongoose.model<IRole>('Role', roleSchema);

/**
 * All available permissions in the system.
 * Used for RBAC authorization checks.
 */
export const PERMISSIONS = {
  // Products
  PRODUCTS_READ: 'products.read',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',

  // Orders
  ORDERS_READ: 'orders.read',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_CANCEL: 'orders.cancel',

  // Inventory
  INVENTORY_READ: 'inventory.read',
  INVENTORY_ADJUST: 'inventory.adjust',

  // Customers
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_UPDATE: 'customers.update',

  // Coupons
  COUPONS_READ: 'coupons.read',
  COUPONS_CREATE: 'coupons.create',
  COUPONS_UPDATE: 'coupons.update',
  COUPONS_DELETE: 'coupons.delete',

  // Reviews
  REVIEWS_READ: 'reviews.read',
  REVIEWS_MODERATE: 'reviews.moderate',

  // Refunds
  REFUNDS_CREATE: 'refunds.create',
  REFUNDS_READ: 'refunds.read',

  // CMS
  CMS_READ: 'cms.read',
  CMS_WRITE: 'cms.write',

  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_WRITE: 'settings.write',

  // Admin Users
  ADMIN_USERS_READ: 'admin_users.read',
  ADMIN_USERS_CREATE: 'admin_users.create',
  ADMIN_USERS_UPDATE: 'admin_users.update',
  ADMIN_USERS_DELETE: 'admin_users.delete',

  // Audit Logs
  AUDIT_READ: 'audit.read',

  // Media
  MEDIA_READ: 'media.read',
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',

  // Categories
  CATEGORIES_READ: 'categories.read',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',

  // Collections
  COLLECTIONS_READ: 'collections.read',
  COLLECTIONS_CREATE: 'collections.create',
  COLLECTIONS_UPDATE: 'collections.update',
  COLLECTIONS_DELETE: 'collections.delete',

  // Shipping
  SHIPPING_READ: 'shipping.read',
  SHIPPING_MANAGE: 'shipping.manage',

  // Returns
  RETURNS_READ: 'returns.read',
  RETURNS_MANAGE: 'returns.manage',

  // Analytics
  ANALYTICS_READ: 'analytics.read',
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
