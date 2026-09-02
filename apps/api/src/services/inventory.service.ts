import mongoose from 'mongoose';
import { Inventory, InventoryTransaction, type InventoryTransactionType } from '../models/Inventory.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

interface ReservationItem {
  variantId: string;
  quantity: number;
}

interface InventoryAdjustment {
  variantId: string;
  type: InventoryTransactionType;
  quantity: number;
  reason?: string;
  orderId?: string;
  performedBy?: string;
}

/**
 * Atomically reserve inventory for checkout.
 * Decrements `available` and increments `reserved`.
 * Fails if any item has insufficient stock.
 *
 * Uses conditional atomic updates (not findAndModify) to prevent overselling
 * under concurrent checkout requests.
 */
export async function reserveInventory(
  items: ReservationItem[],
  orderId: string,
  session: mongoose.ClientSession,
): Promise<void> {
  for (const item of items) {
    // Atomic conditional update: only succeeds if available >= quantity
    const result = await Inventory.findOneAndUpdate(
      {
        variantId: new mongoose.Types.ObjectId(item.variantId),
        $or: [
          { trackInventory: false },
          { allowBackorder: true },
          { available: { $gte: item.quantity } },
        ],
      },
      {
        $inc: {
          available: -item.quantity,
          reserved: item.quantity,
        },
      },
      { session, new: true },
    );

    if (!result) {
      // Check if the inventory record exists at all
      const inv = await Inventory.findOne({
        variantId: new mongoose.Types.ObjectId(item.variantId),
      }).session(session).lean();

      if (!inv) {
        throw ApiError.notFound(`Inventory record for variant ${item.variantId}`);
      }

      throw ApiError.conflict(
        `Insufficient inventory for variant ${item.variantId}. Only ${inv.available} available.`,
        'INSUFFICIENT_INVENTORY',
      );
    }

    // Create transaction record
    await InventoryTransaction.create([{
      variantId: item.variantId,
      type: 'RESERVATION',
      quantity: -item.quantity,
      previousAvailable: result.available + item.quantity,
      newAvailable: result.available,
      orderId,
    }], { session });
  }

  logger.info({ orderId, itemCount: items.length }, 'Inventory reserved for order');
}

/**
 * Release previously reserved inventory (e.g., payment failed or expired).
 * Increments `available` and decrements `reserved`.
 */
export async function releaseReservation(
  items: ReservationItem[],
  orderId: string,
  session?: mongoose.ClientSession,
): Promise<void> {
  const opts = session ? { session } : {};

  for (const item of items) {
    const result = await Inventory.findOneAndUpdate(
      { variantId: new mongoose.Types.ObjectId(item.variantId) },
      {
        $inc: {
          available: item.quantity,
          reserved: -item.quantity,
        },
      },
      { ...opts, new: true },
    );

    if (result) {
      await InventoryTransaction.create([{
        variantId: item.variantId,
        type: 'RESERVATION_RELEASE',
        quantity: item.quantity,
        previousAvailable: result.available - item.quantity,
        newAvailable: result.available,
        orderId,
      }], opts);
    }
  }

  logger.info({ orderId, itemCount: items.length }, 'Inventory reservation released');
}

/**
 * Confirm reserved inventory after payment success.
 * Moves units from `reserved` to `committed`.
 */
export async function confirmReservation(
  items: ReservationItem[],
  orderId: string,
  session?: mongoose.ClientSession,
): Promise<void> {
  const opts = session ? { session } : {};

  for (const item of items) {
    await Inventory.findOneAndUpdate(
      { variantId: new mongoose.Types.ObjectId(item.variantId) },
      {
        $inc: {
          reserved: -item.quantity,
          committed: item.quantity,
        },
      },
      opts,
    );

    await InventoryTransaction.create([{
      variantId: item.variantId,
      type: 'ORDER_CONFIRMED',
      quantity: -item.quantity,
      previousAvailable: 0, // Not changing available
      newAvailable: 0,
      orderId,
    }], opts);
  }

  logger.info({ orderId }, 'Inventory reservation confirmed (committed)');
}

/**
 * Mark committed inventory as sold (after shipment/delivery).
 * Moves units from `committed` to `sold`.
 */
export async function markSold(
  items: ReservationItem[],
  orderId: string,
  session?: mongoose.ClientSession,
): Promise<void> {
  const opts = session ? { session } : {};

  for (const item of items) {
    await Inventory.findOneAndUpdate(
      { variantId: new mongoose.Types.ObjectId(item.variantId) },
      {
        $inc: {
          committed: -item.quantity,
          sold: item.quantity,
        },
      },
      opts,
    );
  }

  logger.info({ orderId }, 'Inventory marked as sold');
}

/**
 * Process a return: increment `available` and `returned`.
 */
export async function processReturn(
  items: ReservationItem[],
  orderId: string,
  session?: mongoose.ClientSession,
): Promise<void> {
  const opts = session ? { session } : {};

  for (const item of items) {
    const result = await Inventory.findOneAndUpdate(
      { variantId: new mongoose.Types.ObjectId(item.variantId) },
      {
        $inc: {
          available: item.quantity,
          returned: item.quantity,
        },
      },
      { ...opts, new: true },
    );

    if (result) {
      await InventoryTransaction.create([{
        variantId: item.variantId,
        type: 'RETURN_RECEIVED',
        quantity: item.quantity,
        previousAvailable: result.available - item.quantity,
        newAvailable: result.available,
        orderId,
      }], opts);
    }
  }

  logger.info({ orderId }, 'Return inventory processed');
}

/**
 * Manual admin adjustment with full audit trail.
 */
export async function manualAdjustment(
  adjustment: InventoryAdjustment,
  session: mongoose.ClientSession,
): Promise<void> {
  const inventory = await Inventory.findOne({
    variantId: new mongoose.Types.ObjectId(adjustment.variantId),
  }).session(session);

  if (!inventory) {
    throw ApiError.notFound(`Inventory record for variant ${adjustment.variantId}`);
  }

  const previousAvailable = inventory.available;
  const newAvailable = previousAvailable + adjustment.quantity;

  if (newAvailable < 0 && !inventory.allowBackorder) {
    throw ApiError.conflict(
      `Cannot reduce inventory below 0. Available: ${previousAvailable}`,
    );
  }

  inventory.available = newAvailable;

  // Handle specific adjustment types
  if (adjustment.type === 'DAMAGED') {
    inventory.damaged += Math.abs(adjustment.quantity);
  }

  await inventory.save({ session });

  await InventoryTransaction.create([{
    variantId: adjustment.variantId,
    type: adjustment.type,
    quantity: adjustment.quantity,
    previousAvailable,
    newAvailable,
    orderId: adjustment.orderId,
    reason: adjustment.reason,
    performedBy: adjustment.performedBy,
  }], { session });

  logger.info({
    variantId: adjustment.variantId,
    type: adjustment.type,
    quantity: adjustment.quantity,
    performedBy: adjustment.performedBy,
  }, 'Manual inventory adjustment');
}
