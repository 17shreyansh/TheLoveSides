import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticateAdmin } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { createCollection, updateCollection, deleteCollection, reorderCollections } from '../../controllers/admin/collection.js';
import { createRoom, updateRoom, deleteRoom, reorderRooms } from '../../controllers/admin/room.js';
import { createProduct, updateProduct, updateProductVariants, listProducts, getProductById, deleteProduct } from '../../controllers/admin/product.js';
import {
  createCollectionSchema, updateCollectionSchema,
  createRoomSchema, updateRoomSchema,
  createProductSchema, updateProductSchema, updateProductVariantsSchema,
  reorderSchema
} from '../../validators/catalog.js';
import { Collection } from '../../models/Collection.js';
import { Room } from '../../models/Room.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// Apply admin authentication to all routes in this router
router.use(authenticateAdmin);

// ========================================
// Collections (Admin)
// ========================================
router.get('/collections', authorize('collections.read'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const collections = await Collection.find({ deletedAt: null }).sort({ sortOrder: 1 }).lean();
    sendSuccess({ res, data: collections });
  } catch (error) { next(error); }
});
router.get('/collections/:id', authorize('collections.read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, deletedAt: null }).lean();
    if (!collection) throw ApiError.notFound('Collection');
    sendSuccess({ res, data: collection });
  } catch (error) { next(error); }
});
router.post('/collections', authorize('collections.create'), validate({ body: createCollectionSchema }), createCollection);
router.patch('/collections/reorder', authorize('collections.update'), validate({ body: reorderSchema }), reorderCollections);
router.patch('/collections/:id', authorize('collections.update'), validate({ body: updateCollectionSchema }), updateCollection);
router.delete('/collections/:id', authorize('collections.delete'), deleteCollection);

// ========================================
// Rooms (Admin)
// ========================================
router.get('/rooms', authorize('collections.read'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await Room.find({ deletedAt: null }).sort({ sortOrder: 1 }).lean();
    sendSuccess({ res, data: rooms });
  } catch (error) { next(error); }
});
router.get('/rooms/:id', authorize('collections.read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, deletedAt: null }).lean();
    if (!room) throw ApiError.notFound('Room');
    sendSuccess({ res, data: room });
  } catch (error) { next(error); }
});
router.post('/rooms', authorize('collections.create'), validate({ body: createRoomSchema }), createRoom);
router.patch('/rooms/reorder', authorize('collections.update'), validate({ body: reorderSchema }), reorderRooms);
router.patch('/rooms/:id', authorize('collections.update'), validate({ body: updateRoomSchema }), updateRoom);
router.delete('/rooms/:id', authorize('collections.delete'), deleteRoom);

// ========================================
// Products (Admin)
// ========================================
router.get('/products', authorize('products.read'), listProducts);
router.get('/products/:id', authorize('products.read'), getProductById);
router.post('/products', authorize('products.create'), validate({ body: createProductSchema }), createProduct);
router.patch('/products/:id', authorize('products.update'), validate({ body: updateProductSchema }), updateProduct);
router.put('/products/:id/variants', authorize('products.update'), validate({ body: updateProductVariantsSchema }), updateProductVariants);
router.delete('/products/:id', authorize('products.delete'), deleteProduct);

export default router;
