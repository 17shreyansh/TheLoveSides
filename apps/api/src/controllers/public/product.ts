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

    const { category, collection, sort } = req.query;

    const query: any = {
      status: 'published',
      deletedAt: null,
    };

    if (req.query.room) query.roomIds = new mongoose.Types.ObjectId(req.query.room as string);
    if (collection) query.collectionIds = new mongoose.Types.ObjectId(collection as string);

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { 'variants.0.price': 1 }; // Requires aggregation for perfect sorting
    if (sort === 'price_desc') sortOptions = { 'variants.0.price': -1 };

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

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      slug,
      status: 'published',
      deletedAt: null,
    })
      .populate('roomIds', 'name slug')
      .populate('collectionIds', 'name slug')
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
