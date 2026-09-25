const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/thelovesides').then(async () => {
  const Product = mongoose.connection.collection('products');
  const ProductVariant = mongoose.connection.collection('productvariants');
  const products = await Product.find({}).limit(2).toArray();
  const productIds = products.map(p => p._id);
  const variants = await ProductVariant.find({ productId: { $in: productIds } }).toArray();
  const productsWithVariants = products.map((product) => ({
      ...product,
      variants: variants.filter((v) => v.productId?.toString() === product._id?.toString()),
    }));
  console.log(JSON.stringify(productsWithVariants[0].variants.length));
  process.exit(0);
});
