import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product } from '../../models/Product.js';
import { ProductVariant } from '../../models/ProductVariant.js';
import { Inventory } from '../../models/Inventory.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { variants, ...productData } = req.body;

    const existing = await Product.findOne({ slug: productData.slug });
    if (existing) {
      throw ApiError.conflict('Product with this slug already exists');
    }

    // 1. Create Product
    const product = await Product.create(productData);

    // 2. Create Variants & Inventory
    const variantsToCreate = variants.map((v: any) => ({
      ...v,
      productId: product._id,
    }));

    const createdVariants = await ProductVariant.insertMany(variantsToCreate);

    // Create inventory ledger for each variant
    const inventoryDocs = createdVariants.map((v: any, index: number) => {
      const variantInput = variants[index];
      return {
        variantId: v._id,
        available: variantInput.inventory?.available || 0,
        lowStockThreshold: variantInput.inventory?.lowStockThreshold || 5,
        trackInventory: variantInput.inventory?.trackInventory ?? true,
        allowBackorder: variantInput.inventory?.allowBackorder ?? false,
      };
    });

    await Inventory.create(inventoryDocs);

    sendSuccess({ res, statusCode: 201, data: product, message: 'Product created successfully' });
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    if (req.body.slug) {
      const existing = await Product.findOne({ slug: req.body.slug, _id: { $ne: id } });
      if (existing) {
        throw ApiError.conflict('Product with this slug already exists');
      }
    }

    // We omit variants update from this endpoint for safety. Variants should be managed individually or via a dedicated endpoint.
    const { variants, ...updateData } = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!product) {
      throw ApiError.notFound('Product');
    }

    sendSuccess({ res, data: product, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function updateProductVariants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: productId } = req.params;
    const { variants } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product');
    }

    const existingVariants = await ProductVariant.find({ productId, deletedAt: null });
    const existingIds = existingVariants.map(v => v._id.toString());
    const payloadIds = variants.filter((v: any) => v._id).map((v: any) => v._id);

    // 1. Soft-delete missing variants
    const idsToDelete = existingIds.filter(id => !payloadIds.includes(id));
    if (idsToDelete.length > 0) {
      await ProductVariant.updateMany(
        { _id: { $in: idsToDelete } },
        { isActive: false, deletedAt: new Date() }
      );
    }

    // 2. Update existing variants & their inventory
    const variantsToUpdate = variants.filter((v: any) => v._id);
    for (const vData of variantsToUpdate) {
      await ProductVariant.findByIdAndUpdate(vData._id, vData);
      if (vData.inventory) {
        await Inventory.findOneAndUpdate(
          { variantId: vData._id },
          { 
            available: vData.inventory.available,
            lowStockThreshold: vData.inventory.lowStockThreshold || 5,
            trackInventory: vData.inventory.trackInventory ?? true,
          }
        );
      }
    }

    // 3. Create new variants & their inventory
    const variantsToCreate = variants.filter((v: any) => !v._id).map((v: any) => ({
      ...v,
      productId,
    }));
    
    if (variantsToCreate.length > 0) {
      const created = await ProductVariant.insertMany(variantsToCreate);
      const inventoryDocs = created.map((v: any, index: number) => {
        const vInput = variantsToCreate[index];
        return {
          variantId: v._id,
          available: vInput.inventory?.available || 0,
          lowStockThreshold: vInput.inventory?.lowStockThreshold || 5,
          trackInventory: vInput.inventory?.trackInventory ?? true,
        };
      });
      await Inventory.insertMany(inventoryDocs);
    }

    sendSuccess({ res, message: 'Product variants updated successfully' });
  } catch (error) {
    next(error);
  }
}


/**
 * List all products (admin) — includes drafts, archived, etc.
 */
export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { deletedAt: null };

    if (req.query.status) query.status = req.query.status;
    if (req.query.room) query.roomIds = new mongoose.Types.ObjectId(req.query.room as string);
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('roomIds', 'name slug')
        .lean(),
      Product.countDocuments(query),
    ]);

    // Fetch variants and inventory for all products in the page
    const productIds = products.map(p => p._id);
    const variants = await ProductVariant.find({ productId: { $in: productIds }, deletedAt: null }).lean();
    
    const variantIds = variants.map(v => v._id);
    const inventories = await Inventory.find({ variantId: { $in: variantIds } }).lean();
    
    const inventoryMap = new Map(inventories.map(inv => [inv.variantId.toString(), inv]));
    
    const variantsByProduct = new Map();
    for (const v of variants) {
      const pId = v.productId.toString();
      if (!variantsByProduct.has(pId)) variantsByProduct.set(pId, []);
      variantsByProduct.get(pId).push({
        ...v,
        inventory: inventoryMap.get(v._id.toString()) || null
      });
    }

    const productsWithVariants = products.map(p => ({
      ...p,
      variants: variantsByProduct.get(p._id.toString()) || []
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

/**
 * Get single product by ID (admin) — includes variants and inventory.
 */
export async function getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, deletedAt: null })
      .populate('roomIds', 'name slug')
      .populate('collectionIds', 'name slug')
      .lean();

    if (!product) {
      throw ApiError.notFound('Product');
    }

    // Fetch variants with inventory data
    const variants = await ProductVariant.find({
      productId: product._id,
      deletedAt: null,
    }).lean();

    const variantIds = variants.map((v) => v._id);
    const inventories = await Inventory.find({
      variantId: { $in: variantIds },
    }).lean();

    const inventoryMap = new Map(
      inventories.map((inv) => [inv.variantId.toString(), inv]),
    );

    const variantsWithInventory = variants.map((v) => ({
      ...v,
      inventory: inventoryMap.get(v._id.toString()) || null,
    }));

    sendSuccess({ res, data: { ...product, variants: variantsWithInventory } });
  } catch (error) {
    next(error);
  }
}

/**
 * Soft-delete a product (admin).
 */
export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), status: 'archived' },
      { new: true },
    );

    if (!product) {
      throw ApiError.notFound('Product');
    }

    // Also deactivate all variants
    await ProductVariant.updateMany(
      { productId: id },
      { isActive: false, deletedAt: new Date() },
    );

    sendSuccess({ res, message: 'Product archived successfully' });
  } catch (error) {
    next(error);
  }
}
