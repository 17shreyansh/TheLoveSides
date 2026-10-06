import mongoose from 'mongoose';
import { Cart } from './src/models/Cart.js';

(async () => {
  await mongoose.connect('mongodb://localhost:27017/thelovesides');
  const carts = await Cart.find({ "items.variantId": new mongoose.Types.ObjectId("6aa4cd23b38bc5f2006084bd") });
  console.log('Carts with this variant:', carts.length);
  
  for (const cart of carts) {
    cart.items = cart.items.filter((item: any) => item.variantId.toString() !== '6aa4cd23b38bc5f2006084bd') as any;
    await cart.save();
    console.log('Cleaned cart', cart._id);
  }
  
  process.exit(0);
})();
