import type { Request, Response, NextFunction } from 'express';
import { Cart } from '../../models/Cart.js';
import { Product } from '../../models/Product.js';
import { ProductVariant } from '../../models/ProductVariant.js';
import { Inventory } from '../../models/Inventory.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import mongoose from 'mongoose';

/**
 * Calculates totals for a cart and returns it.
 * This is the source of truth for pricing.
 */
export async function calculateCartTotals(cart: any) {
  let subtotal = 0;
  const items = cart.items || [];

  for (const item of items) {
    subtotal += item.price * item.quantity;
  }

  // Future: Handle discounts/coupons here
  const discountTotal = 0; 
  
  // Future: Handle shipping and taxes
  const shippingTotal = 0;
  const taxTotal = 0;

  const total = subtotal - discountTotal + shippingTotal + taxTotal;

  return {
    ...cart,
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    total,
  };
}

/**
 * Get or create cart for current user/guest
 */
export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ownerQuery = req.cartOwner.type === 'user' 
      ? { userId: req.cartOwner.id } 
      : { guestId: req.cartOwner.id };

    let cart = await Cart.findOne(ownerQuery).lean();

    if (!cart) {
      const expiresAt = req.cartOwner.type === 'guest' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        : undefined;

      // Type assertion since lean returns a different type
      const newCart = await Cart.create({ ...ownerQuery, items: [], expiresAt });
      cart = newCart.toObject() as any;
    }

    const cartWithTotals = await calculateCartTotals(cart);
    sendSuccess({ res, data: cartWithTotals });
  } catch (error) {
    next(error);
  }
}

/**
 * Add item to cart
 */
export async function addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, variantId, quantity } = req.body;
    
    const ownerQuery = req.cartOwner.type === 'user' 
      ? { userId: req.cartOwner.id } 
      : { guestId: req.cartOwner.id };

    let cart = await Cart.findOne(ownerQuery).session(session);

    if (!cart) {
      const expiresAt = req.cartOwner.type === 'guest' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        : undefined;
      const [newCart] = await Cart.create([{ ...ownerQuery, items: [], expiresAt }], { session });
      cart = newCart;
    }

    // 1. Verify Product & Variant exist
    const [product, variant] = await Promise.all([
      Product.findOne({ _id: productId, status: 'published' }).session(session).lean(),
      ProductVariant.findOne({ _id: variantId, productId, isActive: true }).session(session).lean()
    ]);

    if (!product || !variant) {
      throw ApiError.notFound('Product or variant not found');
    }

    // 2. Check Inventory
    const inventory = await Inventory.findOne({ variantId }).session(session).lean();
    if (!inventory) {
      throw ApiError.notFound('Inventory record not found');
    }

    // Check if item already in cart
    const existingItem = cart.items.find((i: any) => i.variantId.toString() === variantId);
    const newTotalQuantity = (existingItem?.quantity || 0) + quantity;

    if (inventory.trackInventory && !inventory.allowBackorder && inventory.available < newTotalQuantity) {
      throw ApiError.conflict(`Only ${inventory.available} units available in stock`);
    }

    // 3. Add or Update Item
    if (existingItem) {
      existingItem.quantity = newTotalQuantity;
    } else {
      cart.items.push({
        variantId: variant._id,
        productId: product._id,
        quantity,
        name: product.name,
        sku: variant.sku,
        price: variant.salePrice || variant.price,
        image: variant.images?.[0] || product.images?.[0],
        attributes: variant.attributes,
      } as any);
    }

    await cart.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Re-fetch for totals
    const updatedCart = await Cart.findById(cart._id).lean();
    const cartWithTotals = await calculateCartTotals(updatedCart);

    sendSuccess({ res, data: cartWithTotals, message: 'Item added to cart' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}

/**
 * Update item quantity in cart
 */
export async function updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const ownerQuery = req.cartOwner.type === 'user' 
      ? { userId: req.cartOwner.id } 
      : { guestId: req.cartOwner.id };

    const cart = await Cart.findOne(ownerQuery);
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    const item = cart.items.find((i: any) => i._id.toString() === itemId);
    if (!item) {
      throw ApiError.notFound('Item not found in cart');
    }

    // Check inventory before updating
    const inventory = await Inventory.findOne({ variantId: item.variantId }).lean();
    if (inventory && inventory.trackInventory && !inventory.allowBackorder && inventory.available < quantity) {
      throw ApiError.conflict(`Only ${inventory.available} units available in stock`);
    }

    item.quantity = quantity;
    await cart.save();

    const cartWithTotals = await calculateCartTotals(cart.toObject());
    sendSuccess({ res, data: cartWithTotals });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove item from cart
 */
export async function removeCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { itemId } = req.params;

    const ownerQuery = req.cartOwner.type === 'user' 
      ? { userId: req.cartOwner.id } 
      : { guestId: req.cartOwner.id };

    const cart = await Cart.findOne(ownerQuery);
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId) as any;
    await cart.save();

    const cartWithTotals = await calculateCartTotals(cart.toObject());
    sendSuccess({ res, data: cartWithTotals });
  } catch (error) {
    next(error);
  }
}
