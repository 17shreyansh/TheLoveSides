import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';

/**
 * Merges a guest cart into a user's permanent cart.
 * If the user has no cart, the guest cart simply becomes the user's cart.
 * If the user has a cart, matching items add their quantities together.
 */
export async function mergeGuestCartIntoUserCart(guestId: string, userId: string | mongoose.Types.ObjectId): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const guestCart = await Cart.findOne({ guestId }).session(session);
    if (!guestCart || guestCart.items.length === 0) {
      // Nothing to merge
      await session.commitTransaction();
      session.endSession();
      return;
    }

    let userCart = await Cart.findOne({ userId }).session(session);

    if (!userCart) {
      // User doesn't have a cart, just re-assign ownership
      guestCart.userId = new mongoose.Types.ObjectId(userId);
      guestCart.guestId = undefined; // Remove guest ID
      guestCart.expiresAt = undefined; // Permanent carts don't expire
      await guestCart.save({ session });
    } else {
      // Merge items
      for (const guestItem of guestCart.items) {
        const existingItem = userCart.items.find(
          (i: any) => i.variantId.toString() === guestItem.variantId.toString()
        );

        if (existingItem) {
          existingItem.quantity += guestItem.quantity;
        } else {
          userCart.items.push(guestItem);
        }
      }

      await userCart.save({ session });
      
      // Delete the old guest cart
      await Cart.deleteOne({ _id: guestCart._id }, { session });
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Don't throw here, cart merging shouldn't crash login
    console.error('Failed to merge carts during login:', error);
  }
}
