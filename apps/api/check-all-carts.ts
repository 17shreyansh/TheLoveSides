import mongoose from 'mongoose';
import { Cart } from './src/models/Cart.js';

(async () => {
  await mongoose.connect('mongodb://localhost:27017/thelovesides');
  const carts = await Cart.find().lean();
  console.log('Total carts:', carts.length);
  for (const cart of carts) {
    for (const item of cart.items) {
      if (item.variantId.toString() === '6aa4cd23b38bc5f2006084bd') {
        console.log('Found in cart:', cart._id);
      }
    }
  }
  process.exit(0);
})();
