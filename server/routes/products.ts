import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { connectDB, isDbConnected } from '../config/db.ts';
import { Product } from '../models/Product.ts';
import { verifyAdminToken } from '../middleware/auth.ts';
import { PRODUCTS } from '../../src/data/mockData.ts';

export const productsRouter = Router();

/* ── Persistent Local Database Backup (server/data/products.json) ── */
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(PRODUCTS, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[Products File Init Error]:', err);
  }
}

export function getLocalProducts(): any[] {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export function saveLocalProducts(products: any[]): void {
  try {
    ensureDataFile();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.error('[Products Save Local Error]:', err);
  }
}

export function saveOrUpdateLocalProduct(product: any): void {
  try {
    ensureDataFile();
    const list = getLocalProducts();
    const targetId = product.productId || product.id;
    const idx = list.findIndex(p => (p.productId || p.id) === targetId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...product, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(product);
    }
    saveLocalProducts(list);
  } catch (err) {
    console.error('[Save Single Local Product Error]:', err);
  }
}

export function deleteLocalProduct(productId: string): boolean {
  try {
    ensureDataFile();
    const list = getLocalProducts();
    const filtered = list.filter(p => (p.productId || p.id) !== productId && p._id !== productId);
    if (filtered.length !== list.length) {
      saveLocalProducts(filtered);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// GET /api/products - List products with search, filter, and pagination
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const {
      category,
      brand,
      search,
      availability,
      page = '1',
      limit = '100',
      sort = 'newest',
      all = 'false',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(1000, parseInt(limit as string, 10) || 100));
    const showHidden = all === 'true';

    if (isDbConnected()) {
      const filter: Record<string, any> = {};

      if (!showHidden) {
        filter.isVisible = { $ne: false };
      }

      if (category && category !== 'all') {
        filter.$or = [
          { category: category },
          { subcategory: category },
        ];
      }

      if (brand) {
        const brands = (brand as string).split(',').map(b => b.trim());
        filter.brand = { $in: brands };
      }

      if (availability) {
        filter.availability = availability;
      }

      if (search) {
        const regex = new RegExp((search as string).trim(), 'i');
        filter.$or = [
          { name: regex },
          { brand: regex },
          { category: regex },
          { categoryName: regex },
          { subcategory: regex },
          { slug: regex },
          { productId: regex },
          { description: regex },
          { shortSpecs: regex },
        ];
      }

      let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
      if (sort === 'price-low') sortOption = { salePrice: 1 };
      if (sort === 'price-high') sortOption = { salePrice: -1 };
      if (sort === 'rating') sortOption = { rating: -1 };
      if (sort === 'oldest') sortOption = { createdAt: 1 };

      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

      if (total > 0) {
        res.json({
          success: true,
          source: 'mongodb',
          products,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        });
        return;
      }
    }

    // Fallback to local file / catalog if MongoDB is empty or offline
    let filtered = getLocalProducts();

    if (!showHidden) {
      filtered = filtered.filter(p => p.isVisible !== false);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category || p.subcategory === category);
    }

    if (brand) {
      const brands = (brand as string).split(',').map(b => b.trim().toLowerCase());
      filtered = filtered.filter(p => brands.includes(p.brand.toLowerCase()));
    }

    if (search) {
      const q = (search as string).toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (p.productId && p.productId.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (Array.isArray(p.shortSpecs) && p.shortSpecs.some((s: string) => s.toLowerCase().includes(q)))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      source: 'local_storage',
      products: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[Products GET Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// GET /api/products/:id - Single product by ID or Slug
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await connectDB();

    if (isDbConnected()) {
      const product = await Product.findOne({
        $or: [{ productId: id }, { slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      }).lean();

      if (product) {
        res.json({ success: true, product });
        return;
      }
    }

    // Fallback check
    const local = getLocalProducts();
    const localProduct = local.find(p => (p.productId || p.id) === id || p.slug === id);
    if (localProduct) {
      res.json({ success: true, product: localProduct });
      return;
    }

    res.status(404).json({ success: false, error: 'Product not found' });
  } catch (error: any) {
    console.error('[Products GET Single Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// POST /api/products - Create product (Admin protected)
productsRouter.post('/', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.name || (!body.price && !body.regularPrice && !body.salePrice && !body.discountPrice)) {
      res.status(400).json({ success: false, error: 'Product name and price are required.' });
      return;
    }

    const productId = body.productId || body.id || `prod-${Date.now()}`;
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const regularPrice = Number(body.regularPrice || body.price || 0);
    const salePrice = Number(body.salePrice || body.discountPrice || regularPrice);
    const image = body.image || (body.images && body.images[0]) || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop';
    const images = Array.isArray(body.images) && body.images.length > 0 ? body.images : [image];

    const productPayload = {
      productId,
      id: productId,
      name: body.name.trim(),
      slug,
      description: body.description || '',
      price: regularPrice,
      regularPrice,
      salePrice,
      discountPrice: salePrice,
      discountPercentage: Number(body.discountPercentage) || 0,
      image,
      images,
      category: body.category || 'camera',
      categoryName: body.categoryName || (body.category || 'camera').toUpperCase(),
      subcategory: body.subcategory || '',
      brand: body.brand || 'Other',
      stock: Number(body.stock ?? body.stockCount ?? 10),
      stockCount: Number(body.stock ?? body.stockCount ?? 10),
      availability: body.availability || body.stockStatus || 'In Stock',
      stockStatus: body.availability || body.stockStatus || 'In Stock',
      badge: body.badge || '',
      rating: Number(body.rating) || 5.0,
      reviewCount: Number(body.reviewCount) || 0,
      shortSpecs: Array.isArray(body.shortSpecs) ? body.shortSpecs : [],
      specifications: body.specifications || {},
      warranty: body.warranty || '1 Year Official Warranty',
      emiAvailable: !!body.emiAvailable,
      isFeatured: !!body.isFeatured,
      isFlashSale: !!body.isFlashSale,
      isGaming: !!body.isGaming,
      isSmartHome: !!body.isSmartHome,
      isVisible: body.isVisible !== undefined ? !!body.isVisible : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to local backup
    saveOrUpdateLocalProduct(productPayload);

    // Save to MongoDB if connected
    let savedProduct: any = productPayload;
    await connectDB();
    if (isDbConnected()) {
      try {
        const newProduct = new Product(productPayload);
        savedProduct = await newProduct.save();
      } catch (dbErr: any) {
        console.warn('[MongoDB Save Product Warning]:', dbErr.message);
        // If duplicate productId or slug, update existing document
        if (dbErr.code === 11000) {
          try {
            savedProduct = await Product.findOneAndUpdate(
              { $or: [{ productId }, { slug }] },
              { $set: productPayload },
              { returnDocument: 'after', upsert: true }
            );
          } catch (e: any) {
            console.warn('[MongoDB Upsert Fallback Warning]:', e.message);
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct,
    });
  } catch (error: any) {
    console.error('[Products POST Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product (Admin protected)
productsRouter.put('/:id', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const body = req.body || {};

    const updates: Record<string, any> = { ...body, updatedAt: new Date() };

    // Standardize price fields
    if (body.price !== undefined || body.regularPrice !== undefined) {
      const p = Number(body.regularPrice !== undefined ? body.regularPrice : body.price);
      updates.price = p;
      updates.regularPrice = p;
    }
    if (body.salePrice !== undefined || body.discountPrice !== undefined) {
      const sp = Number(body.discountPrice !== undefined ? body.discountPrice : body.salePrice);
      updates.salePrice = sp;
      updates.discountPrice = sp;
    }
    if (body.stock !== undefined || body.stockCount !== undefined) {
      const st = Number(body.stockCount !== undefined ? body.stockCount : body.stock);
      updates.stock = st;
      updates.stockCount = st;
    }
    if (body.availability || body.stockStatus) {
      const stStr = body.availability || body.stockStatus;
      updates.availability = stStr;
      updates.stockStatus = stStr;
    }
    if (body.image && (!body.images || body.images.length === 0)) {
      updates.images = [body.image];
    }

    // Update in local file
    saveOrUpdateLocalProduct({ productId: id, id, ...updates });

    // Update in MongoDB
    let updatedDoc: any = null;
    await connectDB();
    if (isDbConnected()) {
      updatedDoc = await Product.findOneAndUpdate(
        { $or: [{ productId: id }, { id: id }, { slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updates },
        { returnDocument: 'after', runValidators: false }
      );
    }

    const result = updatedDoc || { productId: id, ...updates };
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: result,
    });
  } catch (error: any) {
    console.error('[Products PUT Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product (Admin protected)
productsRouter.delete('/:id', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    // Delete from local file
    deleteLocalProduct(id);

    // Delete from MongoDB
    await connectDB();
    if (isDbConnected()) {
      await Product.findOneAndDelete({
        $or: [{ productId: id }, { id: id }, { slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
    }

    res.json({ success: true, message: 'Product deleted successfully', productId: id });
  } catch (error: any) {
    console.error('[Products DELETE Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to delete product' });
  }
});
