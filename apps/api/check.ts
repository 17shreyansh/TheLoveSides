import mongoose from 'mongoose';
import { ProductVariant } from './src/models/ProductVariant.js';

(async () => {
  await mongoose.connect('mongodb://localhost:27017/thelovesides');
  const variantId = '6aa4cd23b38bc5f2006084bd';
  const variant = await ProductVariant.findById(variantId).lean();
  console.log('Variant Details:');
  console.log(JSON.stringify(variant, null, 2));

  const variantsList = await ProductVariant.find({
    _id: { $in: [new mongoose.Types.ObjectId(variantId)] },
    isActive: true,
    deletedAt: null,
  }).lean();
  console.log('\nVariants matching pricing service query:');
  console.log(JSON.stringify(variantsList, null, 2));

  process.exit(0);
})();
