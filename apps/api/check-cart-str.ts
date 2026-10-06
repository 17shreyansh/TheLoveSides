import mongoose from 'mongoose';
import { Cart } from './src/models/Cart.js';

(async () => {
  await mongoose.connect('mongodb://localhost:27017/thelovesides');
  const cartsStr = await Cart.find({ "items.variantId": "6aa4cd23b38bc5f2006084bd" });
  console.log('Carts with variant as string:', cartsStr.length);
  process.exit(0);
})();
