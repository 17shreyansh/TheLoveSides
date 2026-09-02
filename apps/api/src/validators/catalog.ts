import { z } from 'zod';

// Reusable SEO Schema
const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional(),
});

// Collection
export const createCollectionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image: z.string().url().optional(),
  banner: z.string().url().optional(),
  seo: seoSchema.optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().length(24),
    sortOrder: z.number().int(),
  })).min(1),
});

// Room
export const createRoomSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image: z.string().url().optional(),
  banner: z.string().url().optional(),
  seo: seoSchema.optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  showInNavigation: z.boolean().default(true),
});

export const updateRoomSchema = createRoomSchema.partial();

// Product Variant (embedded in Product)
const createVariantSchema = z.object({
  sku: z.string().min(1),
  barcode: z.string().optional(),
  attributes: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
  }).optional(),
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().default(true),
  isPurchasable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  // Initial inventory
  inventory: z.object({
    available: z.number().int().min(0),
    lowStockThreshold: z.number().int().min(0).default(5),
    trackInventory: z.boolean().default(true),
    allowBackorder: z.boolean().default(false),
  }).optional(),
});

// Product
export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  skuPrefix: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  specifications: z.string().optional(),
  brand: z.string().optional(),
  roomIds: z.array(z.string().length(24)).default([]),
  collectionIds: z.array(z.string().length(24)).default([]),
  tags: z.array(z.string()).default([]),
  attributes: z.array(z.object({
    name: z.string(),
    values: z.array(z.string())
  })).default([]),
  images: z.array(z.string().url()).default([]),
  videos: z.array(z.string().url()).default([]),
  seo: seoSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  hsnCode: z.string().optional(),
  isTaxInclusive: z.boolean().default(true),
  requiresShipping: z.boolean().default(true),
  isReturnable: z.boolean().default(true),
  returnWindowDays: z.number().int().min(0).default(7),
  variants: z.array(createVariantSchema).min(1, 'At least one variant is required'),
});

export const updateProductSchema = createProductSchema.omit({ variants: true }).partial();

export const updateProductVariantsSchema = z.object({
  variants: z.array(createVariantSchema.extend({
    _id: z.string().optional(),
  })).min(1, 'At least one variant is required'),
});
