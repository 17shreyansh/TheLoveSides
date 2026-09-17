import type { Request, Response, NextFunction } from 'express';
import { Wishlist } from '../../models/Wishlist.js';
import { ProductVariant } from '../../models/ProductVariant.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

async function getPopulatedWishlist(userId: string) {
  const wishlistItems = await Wishlist.find({ userId })
    .populate('productId')
    .lean();

  const productIds = wishlistItems.map((item: any) => item.productId?._id).filter(Boolean);
  
  if (productIds.length > 0) {
    const variants = await ProductVariant.find({
      productId: { $in: productIds },
      isActive: true,
      deletedAt: null,
    }).lean();

    return wishlistItems.map((item: any) => {
      if (item.productId) {
        item.productId.variants = variants.filter((v: any) => v.productId?.toString() === item.productId._id?.toString());
      }
      return item;
    });
  }

  return wishlistItems;
}

export async function getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const wishlistItems = await getPopulatedWishlist(req.user!.id);
    sendSuccess({ res, data: wishlistItems });
  } catch (error) {
    next(error);
  }
}

export async function addToWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId } = req.body;

    await Wishlist.findOneAndUpdate(
      { userId: req.user!.id, productId },
      { userId: req.user!.id, productId },
      { new: true, upsert: true }
    );

    const wishlistItems = await getPopulatedWishlist(req.user!.id);
    sendSuccess({ res, data: wishlistItems, message: 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId = req.params.productId as string;

    await Wishlist.findOneAndDelete({ userId: req.user!.id, productId });

    const wishlistItems = await getPopulatedWishlist(req.user!.id);
    sendSuccess({ res, data: wishlistItems, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
}
