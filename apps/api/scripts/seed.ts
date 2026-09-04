import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';
import { hashPassword } from '../src/utils/password.js';

// Models
import { Role, ALL_PERMISSIONS } from '../src/models/Role.js';
import { AdminUser } from '../src/models/AdminUser.js';
import { CmsPage } from '../src/models/CmsPage.js';
import { Collection } from '../src/models/Collection.js';
import { Product } from '../src/models/Product.js';
import { ProductVariant } from '../src/models/ProductVariant.js';
import { Inventory } from '../src/models/Inventory.js';

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
          'categories.read', 'categories.create', 'categories.update'
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

    // 4. Collections & Placeholder Products
    logger.info('Seeding collections and products...');
    
    // Collection 1: Rings
    const ringsCol = await Collection.findOneAndUpdate(
      { slug: 'rings' },
      { name: 'Rings', slug: 'rings', description: 'Beautiful handcrafted rings.', isActive: true, sortOrder: 1 },
      { new: true, upsert: true }
    );

    // Collection 2: Necklaces
    const necklacesCol = await Collection.findOneAndUpdate(
      { slug: 'necklaces' },
      { name: 'Necklaces', slug: 'necklaces', description: 'Elegant necklaces for every occasion.', isActive: true, sortOrder: 2 },
      { new: true, upsert: true }
    );

    // Seed a product if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const product1 = await Product.create({
        name: 'Classic Diamond Ring',
        slug: 'classic-diamond-ring',
        description: 'A timeless classic diamond ring made with 18k white gold.',
        collectionIds: [ringsCol._id],
        isActive: true,
        status: 'published',
        attributes: [
          { name: 'Material', values: ['18k White Gold'] },
          { name: 'Size', values: ['7'] }
        ]
      });

      const variant1 = await ProductVariant.create({
        productId: product1._id,
        sku: 'RNG-DIA-01-WHT',
        price: 50000,
        attributes: [
          { name: 'Material', value: '18k White Gold' },
          { name: 'Size', value: '7' }
        ],
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
        collectionIds: [necklacesCol._id],
        isActive: true,
        status: 'published',
        attributes: [
          { name: 'Material', values: ['Sterling Silver'] }
        ]
      });

      const variant2 = await ProductVariant.create({
        productId: product2._id,
        sku: 'NCK-PRL-01-SLV',
        price: 15000,
        attributes: [
          { name: 'Material', value: 'Sterling Silver' }
        ],
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
