import { Router } from 'express';
import { getActiveRooms, getRoomBySlug } from '../controllers/public/room.js';
import { getActiveCollections, getCollectionBySlug } from '../controllers/public/collection.js';
import { listProducts, getProductBySlug, searchProducts } from '../controllers/public/product.js';

const router = Router();

// Rooms
router.get('/rooms', getActiveRooms);
router.get('/rooms/:slug', getRoomBySlug);

// Collections
router.get('/collections', getActiveCollections);
router.get('/collections/:slug', getCollectionBySlug);

// Products
router.get('/products', listProducts);
router.get('/products/search', searchProducts);
router.get('/products/:slug', getProductBySlug);

export default router;
