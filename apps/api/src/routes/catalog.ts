import { Router } from 'express';
import { getActiveRooms, getRoomBySlug } from '../controllers/public/room.js';
import { getActiveCollections, getCollectionBySlug } from '../controllers/public/collection.js';
import { getActiveCategories, getCategoryBySlug } from '../controllers/public/category.js';
import { getActiveSubCategories, getSubCategoryBySlug } from '../controllers/public/subCategory.js';
import { listProducts, getProductBySlug, searchProducts, getAvailableColors } from '../controllers/public/product.js';

const router = Router();

// Rooms
router.get('/rooms', getActiveRooms);
router.get('/rooms/:slug', getRoomBySlug);

// Collections
router.get('/collections', getActiveCollections);
router.get('/collections/:slug', getCollectionBySlug);

// Categories
router.get('/categories', getActiveCategories);
router.get('/categories/:slug', getCategoryBySlug);

// SubCategories
router.get('/subcategories', getActiveSubCategories);
router.get('/subcategories/:slug', getSubCategoryBySlug);

// Products
router.get('/products/colors', getAvailableColors);
router.get('/products', listProducts);
router.get('/products/search', searchProducts);
router.get('/products/:slug', getProductBySlug);

export default router;
