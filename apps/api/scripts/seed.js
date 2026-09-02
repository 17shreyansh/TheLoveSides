import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { Category } from '../src/models/Category.js';
async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(env.MONGO_URI);
        console.log('✅ Connected');
        // Read the products data file (we'll parse it statically for seeding)
        // The data is in apps/storefront/src/data/products.js
        console.log('Note: Seed logic for products is a placeholder.');
        console.log('To fully migrate the legacy JS data into normalized MongoDB variants,');
        console.log('we will build a dedicated migration script in Phase 5.');
        // Create base categories if they don't exist
        const categories = [
            { name: 'Blackout Curtains', slug: 'blackout-curtains', description: 'Complete light blockage' },
            { name: 'Sheer Curtains', slug: 'sheer-curtains', description: 'Light and airy' },
            { name: 'Velvet Curtains', slug: 'velvet-curtains', description: 'Luxurious heavy drape' },
            { name: 'Roller Blinds', slug: 'roller-blinds', description: 'Modern clean lines' }
        ];
        for (const cat of categories) {
            await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
        }
        console.log('✅ Base categories seeded successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}
run();
//# sourceMappingURL=seed.js.map