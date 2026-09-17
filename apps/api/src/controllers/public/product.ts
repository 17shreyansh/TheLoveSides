import type { Request, Response, NextFunction } from 'express';
import { Product } from '../../models/Product.js';
import { ProductVariant } from '../../models/ProductVariant.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import mongoose from 'mongoose';

export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { collection, category, subcategory, sort } = req.query;

    const query: any = {
      status: 'published',
      deletedAt: null,
    };

    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }
    
    if (req.query.bestseller === 'true') {
      query.isBestSeller = true;
    }

    if (req.query.room) {
      const roomStr = req.query.room as string;
      if (mongoose.Types.ObjectId.isValid(roomStr)) {
        query.roomIds = new mongoose.Types.ObjectId(roomStr);
      } else {
        const roomDoc = await mongoose.model('Room').findOne({ slug: roomStr }).lean();
        if (roomDoc) query.roomIds = (roomDoc as any)._id;
      }
    }

    if (collection) {
      const collStr = collection as string;
      if (mongoose.Types.ObjectId.isValid(collStr)) {
        query.collectionIds = new mongoose.Types.ObjectId(collStr);
      } else {
        const collDoc = await mongoose.model('Collection').findOne({ slug: collStr }).lean();
        if (collDoc) query.collectionIds = (collDoc as any)._id;
      }
    }

    if (category) {
      const catStr = category as string;
      if (mongoose.Types.ObjectId.isValid(catStr)) {
        query.categoryIds = new mongoose.Types.ObjectId(catStr);
      } else {
        const catDoc = await mongoose.model('Category').findOne({ slug: catStr }).lean();
        if (catDoc) query.categoryIds = (catDoc as any)._id;
      }
    }

    if (subcategory) {
      const subCatStr = subcategory as string;
      if (mongoose.Types.ObjectId.isValid(subCatStr)) {
        query.subCategoryIds = new mongoose.Types.ObjectId(subCatStr);
      } else {
        const subCatDoc = await mongoose.model('SubCategory').findOne({ slug: subCatStr }).lean();
        if (subCatDoc) query.subCategoryIds = (subCatDoc as any)._id;
      }
    }

    if (req.query.color) {
      // Escape special characters just in case, but assume colorStr is like "Blue"
      const colorStr = (req.query.color as string).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query.attributes = {
        $elemMatch: {
          name: { $regex: /^color$/i },
          // Match exactly the color, or the color followed by anything in parentheses e.g. "BLUE (#123456)"
          values: { $regex: new RegExp(`^${colorStr}(?:\\s*\\(.*\\))?$`, 'i') }
        }
      };
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { 'variants.0.price': 1 }; // Requires aggregation for perfect sorting
    if (sort === 'price_desc') sortOptions = { 'variants.0.price': -1 };
    
    // Auto best seller sorting (by highest salesCount)
    if (req.query.bestseller_auto === 'true') {
      sortOptions = { salesCount: -1, createdAt: -1 };
    }

    // For simplicity in Phase 2, we fetch products and populate variants
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'roomIds',
          select: 'name slug',
        })
        .lean(),
      Product.countDocuments(query),
    ]);

    const productIds = products.map((p: any) => p._id);
    const variants = await ProductVariant.find({
      productId: { $in: productIds },
      isActive: true,
      deletedAt: null,
    }).lean();

    // Map variants back to products
    const productsWithVariants = products.map((product: any) => ({
      ...product,
      variants: variants.filter((v: any) => v.productId?.toString() === product._id?.toString()),
    }));

    sendPaginated(res, productsWithVariants, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
}

const colorHexMap: Record<string, string> = {
  'Ivory': '#F5F1E8',
  'Beige': '#D9CFC1',
  'Sage': '#7C9885',
  'Charcoal': '#2B3138',
  'Navy': '#2E4570',
  'Blush': '#DDBFC9',
  'White': '#FFFFFF',
  'Black': '#000000',
  'Red': '#FF0000',
  'Blue': '#0000FF',
  'Green': '#00FF00',
  'Yellow': '#FFFF00',
  'Grey': '#808080',
  'Brown': '#A52A2A',
};

export async function getAvailableColors(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await Product.find({ status: 'published', deletedAt: null }).select('attributes').lean();
    
    const colorsSet = new Set<string>();
    
    products.forEach((product: any) => {
      product.attributes?.forEach((attr: any) => {
        if (attr.name.toLowerCase() === 'color') {
          attr.values.forEach((val: string) => colorsSet.add(val));
        }
      });
    });

    const colors = Array.from(colorsSet).map((rawColor, index) => {
      // Parse "BLUE (#0122c6)" or similar
      const match = rawColor.match(/^(.*?)\s*\(\s*(#[0-9A-Fa-f]{3,6})\s*\)$/);
      let label = rawColor.trim();
      let hex = '';

      if (match) {
        label = match[1].trim();
        hex = match[2];
      }

      // Title case the label (e.g. "BLUE" -> "Blue")
      label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();

      // Fallback hex logic if no hex in string
      if (!hex) {
        const mapKey = Object.keys(colorHexMap).find(k => k.toLowerCase() === label.toLowerCase());
        hex = mapKey ? colorHexMap[mapKey] : '#CCCCCC';
      }

      return {
        id: index + 1,
        label,
        hex,
      };
    });

    // Remove duplicates that might happen after label normalization
    const uniqueColors = Array.from(new Map(colors.map(c => [c.label.toLowerCase(), c])).values());

    sendSuccess({ res, data: uniqueColors });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const query: any = {
      status: 'published',
      deletedAt: null,
    };

    if (typeof slug === 'string' && mongoose.Types.ObjectId.isValid(slug)) {
      query.$or = [{ _id: slug }, { slug: slug }];
    } else {
      query.slug = slug;
    }

    const product = await Product.findOne(query)
      .populate('roomIds', 'name slug')
      .populate('collectionIds', 'name slug')
      .populate('categoryIds', 'name slug')
      .populate('subCategoryIds', 'name slug')
      .lean();

    if (!product) {
      throw ApiError.notFound('Product');
    }

    const variants = await ProductVariant.find({
      productId: product._id,
      isActive: true,
      deletedAt: null,
    }).lean();

    sendSuccess({ res, data: { ...product, variants } });
  } catch (error) {
    next(error);
  }
}

export async function searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      sendSuccess({ res, data: [] });
      return;
    }

    const products = await Product.find(
      {
        $text: { $search: q },
        status: 'published',
        deletedAt: null,
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .select('name slug images shortDescription')
      .lean();

    sendSuccess({ res, data: products });
  } catch (error) {
    next(error);
  }
}
