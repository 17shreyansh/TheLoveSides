import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { hashPassword } from '../utils/password.js';

// Models
import { Role, ALL_PERMISSIONS } from '../models/Role.js';
import { AdminUser } from '../models/AdminUser.js';
import { CmsPage } from '../models/CmsPage.js';
import { Room } from '../models/Room.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Inventory } from '../models/Inventory.js';

async function seedDatabase() {
  logger.info('Connecting to database for seeding...');
  await mongoose.connect(env.MONGO_URI);
  logger.info('Connected to MongoDB');

  try {
    // 1. Roles
    logger.info('Seeding roles...');
    const superAdminRole = await Role.findOneAndUpdate(
      { name: 'Super Admin' },
      {
        name: 'Super Admin',
        description: 'Full system access',
        permissions: ALL_PERMISSIONS,
        isSystem: true,
      },
      { new: true, upsert: true }
    );

    await Role.findOneAndUpdate(
      { name: 'Store Manager' },
      {
        name: 'Store Manager',
        description: 'Manage products, orders, and customers',
        permissions: [
          'products.read', 'products.create', 'products.update',
          'orders.read', 'orders.update',
          'customers.read', 'customers.update',
          'rooms.read', 'rooms.create', 'rooms.update'
        ],
        isSystem: true,
      },
      { new: true, upsert: true }
    );

    // 2. Superadmin User
    logger.info('Seeding superadmin user...');
    const adminEmail = 'admin@thelovesides.com';
    const adminExists = await AdminUser.findOne({ email: adminEmail });
    if (!adminExists) {
      const passwordHash = await hashPassword('Admin@123!');
      await AdminUser.create({
        email: adminEmail,
        passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        role: superAdminRole._id,
      });
      logger.info(`Superadmin created: ${adminEmail} (password: Admin@123!)`);
    } else {
      logger.info('Superadmin already exists. Skipping.');
    }

    // 3. CMS Pages
    logger.info('Seeding CMS pages...');
    const pages = [
      { title: 'About Us', slug: 'about-us', type: 'page', content: '<h2>About TheLoveSides</h2><p>Welcome to our premium e-commerce store.</p>' },
      { title: 'Privacy Policy', slug: 'privacy-policy', type: 'legal', content: '<h2>Privacy Policy</h2><p>Your privacy is important to us.</p>' },
      { title: 'Terms of Service', slug: 'terms-of-service', type: 'legal', content: '<h2>Terms of Service</h2><p>By using this site, you agree to these terms.</p>' },
      { title: 'Returns & Refunds', slug: 'returns-refunds', type: 'legal', content: '<h2>Returns Policy</h2><p>We offer a 30-day return policy for unused items.</p>' },
    ];

    for (const page of pages) {
      await CmsPage.findOneAndUpdate(
        { slug: page.slug },
        { ...page, status: 'published' },
        { upsert: true }
      );
    }

    // 4. Rooms & Placeholder Products
    logger.info('Seeding rooms and products...');
    
    // Room 1: Living Room
    const livingRoom = await Room.findOneAndUpdate(
      { slug: 'living-room' },
      { name: 'Living Room', slug: 'living-room', description: 'Beautiful handcrafted furniture.', isActive: true },
      { new: true, upsert: true }
    );

    // Room 2: Bedroom
    const bedroom = await Room.findOneAndUpdate(
      { slug: 'bedroom' },
      { name: 'Bedroom', slug: 'bedroom', description: 'Elegant beds and tables.', isActive: true },
      { new: true, upsert: true }
    );

    // Seed a product if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const product1 = await Product.create({
        name: 'Classic Diamond Ring',
        slug: 'classic-diamond-ring',
        description: 'A timeless classic diamond ring made with 18k white gold.',
        roomIds: [livingRoom._id],
        isActive: true,
        status: 'published',
      });

      const variant1 = await ProductVariant.create({
        productId: product1._id,
        sku: 'RNG-DIA-01-WHT',
        name: 'White Gold',
        basePrice: 50000,
        attributes: { material: '18k White Gold', size: '7' },
      });

      await Inventory.create({
        variantId: variant1._id,
        available: 10,
        reserved: 0,
      });

      const product2 = await Product.create({
        name: 'Pearl Pendant Necklace',
        slug: 'pearl-pendant-necklace',
        description: 'A beautiful freshwater pearl pendant on a silver chain.',
        roomIds: [bedroom._id],
        isActive: true,
        status: 'published',
      });

      const variant2 = await ProductVariant.create({
        productId: product2._id,
        sku: 'NCK-PRL-01-SLV',
        name: 'Silver',
        basePrice: 15000,
        attributes: { material: 'Sterling Silver' },
      });

      await Inventory.create({
        variantId: variant2._id,
        available: 25,
        reserved: 0,
      });

      logger.info('Products seeded successfully.');
    } else {
      logger.info('Products already exist. Skipping.');
    }

    logger.info('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error seeding database');
    process.exit(1);
  }
}

seedDatabase();
