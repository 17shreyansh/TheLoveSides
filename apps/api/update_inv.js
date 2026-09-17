import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/thelovesides').then(async () => {
  const Inventory = mongoose.model('Inventory', new mongoose.Schema({ available: Number, trackInventory: Boolean, variantId: mongoose.Schema.Types.ObjectId }));
  await Inventory.updateMany({}, { $set: { available: 100, trackInventory: false } });
  console.log('Updated all to available: 100, trackInventory: false');
  process.exit(0);
});
