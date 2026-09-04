import mongoose from 'mongoose';
import { env } from './apps/api/src/config/env.js';
import { Product } from './apps/api/src/models/Product.js';
import { Collection } from './apps/api/src/models/Collection.js';
import { Room } from './apps/api/src/models/Room.js';

async function checkDb() {
  await mongoose.connect(env.MONGO_URI);
  
  const products = await Product.find({}, 'name status deletedAt');
  console.log('Products:', products);

  const collections = await Collection.find({}, 'name isActive deletedAt startDate endDate');
  console.log('Collections:', collections);

  const rooms = await Room.find({}, 'name isActive deletedAt');
  console.log('Rooms:', rooms);

  process.exit(0);
}

checkDb();
