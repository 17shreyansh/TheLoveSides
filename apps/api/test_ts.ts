import mongoose from 'mongoose';
import { transitionOrderStatus } from './src/services/order.service.ts';
import { Order } from './src/models/Order.ts';

async function main() {
  await mongoose.connect('mongodb://localhost:27017/thelovesides');
  const lastOrder = await Order.findOne({ status: 'PENDING_PAYMENT' }).sort({ _id: -1 });
  if (lastOrder) {
    try {
      await transitionOrderStatus(lastOrder.id, 'PAID', 'Payment verified', lastOrder.userId.toString());
      console.log('Success!');
    } catch (e) {
      console.error('Error transitioning:', e);
    }
  } else {
    console.log('No pending order found');
  }
  process.exit(0);
}
main().catch(console.error);
