const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/thelovesides').then(async () => {
  const Product = mongoose.connection.collection('products');
  const ProductVariant = mongoose.connection.collection('productvariants');
  const products = await Product.find({}).toArray();
  const productIds = products.map(p => p._id);
  const variants = await ProductVariant.find({ productId: { $in: productIds } }).toArray();
  const productsWithNoVariants = products.filter(p => !variants.some(v => v.productId.equals(p._id)));
  console.log('Products without variants:', productsWithNoVariants.length);
  if (productsWithNoVariants.length > 0) {
     console.log('Sample missing variant product:', productsWithNoVariants[0].name);
  }
  process.exit(0);
});
