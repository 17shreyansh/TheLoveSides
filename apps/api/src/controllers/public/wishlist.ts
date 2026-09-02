import type { Request, Response, NextFunction } from 'express';
import { Wishlist } from '../../models/Wishlist.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

export async function getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.user!.id })
      .populate('productId')
      .lean();

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

    const wishlistItems = await Wishlist.find({ userId: req.user!.id }).populate('productId').lean();
    sendSuccess({ res, data: wishlistItems, message: 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId = req.params.productId as string;

    await Wishlist.findOneAndDelete({ userId: req.user!.id, productId });

    const wishlistItems = await Wishlist.find({ userId: req.user!.id }).populate('productId').lean();
    sendSuccess({ res, data: wishlistItems, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
}
