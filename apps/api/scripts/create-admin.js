import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { AdminUser } from '../src/models/AdminUser.js';
import { Role, ALL_PERMISSIONS } from '../src/models/Role.js';
import { hashPassword } from '../src/utils/password.js';
async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(env.MONGO_URI);
        console.log('✅ Connected');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@thelovesides.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-immediately';
        // 1. Ensure SUPER_ADMIN role exists
        let superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
        if (!superAdminRole) {
            superAdminRole = await Role.create({
                name: 'SUPER_ADMIN',
                description: 'Has access to all system features',
                permissions: ALL_PERMISSIONS,
                isSystem: true,
            });
            console.log('Created SUPER_ADMIN role');
        }
        // 2. Ensure basic roles exist for future use
        const rolesToCreate = [
            { name: 'STORE_MANAGER', permissions: [
                    'products.read', 'products.create', 'products.update', 'products.delete',
                    'orders.read', 'orders.update', 'inventory.read', 'inventory.adjust'
                ] },
            { name: 'CUSTOMER_SUPPORT', permissions: [
                    'orders.read', 'orders.update', 'customers.read', 'refunds.read', 'returns.read'
                ] },
        ];
        for (const roleDef of rolesToCreate) {
            const exists = await Role.findOne({ name: roleDef.name });
            if (!exists) {
                await Role.create({ ...roleDef, isSystem: true });
                console.log(`Created ${roleDef.name} role`);
            }
        }
        // 3. Create initial super admin user
        const existingAdmin = await AdminUser.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(`Admin user ${adminEmail} already exists`);
            process.exit(0);
        }
        const passwordHash = await hashPassword(adminPassword);
        await AdminUser.create({
            email: adminEmail,
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            role: superAdminRole._id,
        });
        console.log(`✅ Successfully created admin user: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('⚠️ Please change the password upon first login.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}
run();
//# sourceMappingURL=create-admin.js.map