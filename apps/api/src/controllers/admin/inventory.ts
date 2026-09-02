import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Inventory, InventoryTransaction } from '../../models/Inventory.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function adjustInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { variantId } = req.params;
    const { type, quantity, reason } = req.body;

    const inventory = await Inventory.findOne({ variantId });
    if (!inventory) {
      throw ApiError.notFound('Inventory record not found for variant');
    }

    const previousAvailable = inventory.available;
    const newAvailable = previousAvailable + quantity;

    if (newAvailable < 0 && !inventory.allowBackorder) {
      throw ApiError.conflict(`Insufficient inventory. Available: ${previousAvailable}`);
    }

    inventory.available = newAvailable;
    await inventory.save();

    const transaction = await InventoryTransaction.create([{
      variantId,
      type,
      quantity,
      previousAvailable,
      newAvailable,
      reason,
      performedBy: req.user?.id, // Requires Admin Auth
    }]);

    sendSuccess({ res, data: { inventory, transaction: transaction[0] }, message: 'Inventory adjusted successfully' });
  } catch (error) {
    console.error("ADJUST INVENTORY ERROR:", error);
    next(error);
  }
}

export async function getInventoryHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { variantId } = req.params;
    
    // Pagination (optional, default 20)
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find({ variantId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('performedBy', 'firstName lastName email')
        .lean(),
      InventoryTransaction.countDocuments({ variantId })
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
