const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/thelovesides').then(async () => {
  const Product = mongoose.connection.collection('products');
  const ProductVariant = mongoose.connection.collection('productvariants');
  const products = await Product.find({}).limit(10).toArray();
  const productIds = products.map(p => p._id);
  const variants = await ProductVariant.find({ productId: { $in: productIds } }).toArray();
  console.log('Products:', products.length);
  console.log('Variants:', variants.length);
  if (variants.length > 0) {
    console.log('Sample variant price:', variants[0].price);
    console.log('Sample variant productId type:', typeof variants[0].productId, variants[0].productId);
    console.log('Sample product _id type:', typeof products[0]._id, products[0]._id);
  }
  process.exit(0);
});
