const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/thelovesides').then(async () => {
  const Product = mongoose.connection.collection('products');
  const ProductVariant = mongoose.connection.collection('productvariants');
  const products = await Product.find({}).project({ name: 1, slug: 1, images: 1, shortDescription: 1 }).limit(10).toArray();
  const productIds = products.map(p => p._id);
  const variants = await ProductVariant.find({ productId: { $in: productIds }, isActive: true, deletedAt: null }).toArray();
  const productsWithVariants = products.map(p => ({
    ...p,
    variants: variants.filter(v => v.productId.toString() === p._id.toString())
  }));
  console.log('Products:', productsWithVariants.length);
  if (productsWithVariants.length > 0) {
    console.log('Variants for first product:', productsWithVariants[0].variants.length);
    if (productsWithVariants[0].variants.length > 0) {
      console.log('First variant price:', productsWithVariants[0].variants[0].price);
    }
  }
  process.exit(0);
});
