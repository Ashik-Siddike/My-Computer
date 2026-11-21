import { Router, type Request, type Response } from 'express';
import { connectDB, isDbConnected } from '../config/db.ts';
import { Product } from '../models/Product.ts';
import { User } from '../models/User.ts';
import { Admin } from '../models/Admin.ts';
import { Counter } from '../models/Counter.ts';
import { seedCategoriesIfEmpty } from './categories.ts';
import { PRODUCTS } from '../../src/data/mockData.ts';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const seedRouter = Router();

export async function runDatabaseSeed(force = false) {
  await connectDB();
  if (!isDbConnected()) {
    return { success: false, message: 'Database not connected. Please verify MONGODB_URI in .env.' };
  }

  // 1. Seed / verify Admin user
  const adminEmail = (process.env.ADMIN_EMAIL || 'salesmycomputer2025@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'mycomputer';
  const adminName = process.env.ADMIN_NAME || 'Store Administrator';
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  // Ensure in Admin collection
  await Admin.findOneAndUpdate(
    { username: adminUsername },
    {
      $set: {
        username: adminUsername,
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  console.log(`[Seed] Provisioned Admin account: ${adminUsername} in admins collection`);

  // Ensure in User collection
  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  // 2. Initialize Order Counter if not exists
  const existingCounter = await Counter.findById('orderId');
  if (!existingCounter) {
    await Counter.create({ _id: 'orderId', seq: 10000 });
    console.log('[Seed] Initialized Order Counter starting at 10000');
  }

  // 3. Seed Categories
  await seedCategoriesIfEmpty();

  // 4. Seed Products
  const currentCount = await Product.countDocuments();
  if (currentCount === 0 || force) {
    console.log(`[Seed] Syncing ${PRODUCTS.length} products to MongoDB...`);
    let synced = 0;
    for (const p of PRODUCTS) {
      // Map security to camera if needed
      let category = p.category;
      if (category === 'security' || category === 'cctv-security') category = 'camera';
      if (category === 'server-storage') category = 'server';

      await Product.findOneAndUpdate(
        { productId: p.id },
        {
          productId: p.id,
          name: p.name,
          slug: p.slug || p.id,
          description: p.shortSpecs ? p.shortSpecs.join('. ') : p.name,
          price: p.regularPrice,
          salePrice: p.discountPrice,
          discountPercentage: p.discountPercentage || 0,
          image: p.images && p.images.length > 0 ? p.images[0] : '',
          images: p.images || [],
          category,
          categoryName: p.categoryName || category.toUpperCase(),
          subcategory: p.subcategory || '',
          brand: p.brand,
          stock: p.stockCount !== undefined ? p.stockCount : 10,
          availability: p.stockStatus || 'In Stock',
          badge: p.badge || '',
          rating: p.rating || 5.0,
          reviewCount: p.reviewCount || 0,
          shortSpecs: p.shortSpecs || [],
          specifications: p.specifications || {},
          warranty: p.warranty || '1 Year Official Warranty',
          emiAvailable: !!p.emiAvailable,
          isFeatured: !!p.isFeatured,
          isFlashSale: !!p.isFlashSale,
          isGaming: !!p.isGaming,
          isSmartHome: !!p.isSmartHome,
          isVisible: true,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      synced++;
    }
    console.log(`[Seed] Successfully synced ${synced} products to MongoDB!`);
    return {
      success: true,
      message: `Database seeded successfully: ${synced} products synced and Admin account ready.`,
      adminEmail,
      productsCount: synced,
    };
  }

  return {
    success: true,
    message: `Database already initialized (${currentCount} products exist). Admin account ready.`,
    adminEmail,
    productsCount: currentCount,
  };
}

seedRouter.post('/seed', async (req: Request, res: Response) => {
  try {
    const force = req.query.force === 'true';
    const result = await runDatabaseSeed(force);
    res.json(result);
  } catch (error: any) {
    console.error('[Seed Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Database seed failed',
    });
  }
});
