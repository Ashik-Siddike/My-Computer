import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { connectDB, isDbConnected } from '../config/db.ts';
import { Category } from '../models/Category.ts';
import { verifyAdminToken } from '../middleware/auth.ts';

export const categoriesRouter = Router();

/* ── Persistent Local Database Backup (server/data/categories.json) ── */
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

// Default 8 Categories specified by user
export const INITIAL_CATEGORIES = [
  {
    id: 'camera',
    name: 'Camera',
    nameBn: 'ক্যামেরা',
    icon: 'Camera',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
    itemCount: 85,
    order: 1,
    popular: true,
    isVisible: true,
    subCategories: [
      {
        id: 'ezviz-camera',
        name: 'EZVIZ Smart Cameras',
        nameBn: 'ইজভিজ ক্যামেরা',
        hasChildren: true,
        children: [
          { id: 'ezviz-camera', name: 'All EZVIZ Wi-Fi Cameras', nameBn: 'সকল ইজভিজ ক্যামেরা', brand: 'EZVIZ' },
          { id: 'ezviz-camera', name: 'Indoor Pan & Tilt Cameras', nameBn: 'ইনডোর ক্যামেরা', brand: 'EZVIZ' },
          { id: 'ezviz-camera', name: 'Outdoor Color Night Vision', nameBn: 'আউটডোর ক্যামেরা', brand: 'EZVIZ' },
          { id: 'ezviz-camera', name: '4G Battery & Solar Cameras', nameBn: 'সোলার ও ব্যাটারি ক্যামেরা', brand: 'EZVIZ' },
        ],
      },
      {
        id: 'action-camera',
        name: 'Action Camera',
        nameBn: 'অ্যাকশন ক্যামেরা',
        hasChildren: true,
        children: [
          { id: 'action-camera', name: 'GoPro Action Cameras', nameBn: 'গোপ্রো ক্যামেরা', brand: 'GoPro' },
          { id: 'action-camera', name: 'DJI Action Cameras', nameBn: 'ডিজেআই ক্যামেরা', brand: 'DJI' },
          { id: 'action-camera', name: 'Insta360 360° Cameras', nameBn: 'ইনস্টা৩৬০ ক্যামেরা', brand: 'Insta360' },
        ],
      },
      {
        id: 'dslr',
        name: 'DSLR & Mirrorless',
        nameBn: 'ডিএসএলআর ও মিররলেস',
        hasChildren: true,
        children: [
          { id: 'mirrorless-camera', name: 'Sony Alpha Mirrorless', nameBn: 'সনি মিররলেস', brand: 'Sony' },
          { id: 'dslr', name: 'Canon EOS Cameras', nameBn: 'ক্যানন ক্যামেরা', brand: 'Canon' },
          { id: 'mirrorless-camera', name: 'Fujifilm X-Series', nameBn: 'ফুজিফিল্ম', brand: 'Fujifilm' },
        ],
      },
      { id: 'dash-cam', name: 'Dash Cam & Security', nameBn: 'ড্যাশ ক্যাম' },
      { id: 'camera-lenses', name: 'Camera Lenses', nameBn: 'ক্যামেরা লেন্স' },
      { id: 'camera-accessories', name: 'Gimbals, Tripods & Accessories', nameBn: 'গিম্বল ও এক্সেসরিজ' },
    ],
  },
  {
    id: 'networking',
    name: 'Networking',
    nameBn: 'নেটওয়ার্কিং',
    icon: 'Wifi',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600&auto=format&fit=crop',
    itemCount: 145,
    order: 2,
    popular: true,
    isVisible: true,
    subCategories: [
      {
        id: 'wifi-routers',
        name: 'Wi-Fi Routers',
        nameBn: 'রাউটার',
        hasChildren: true,
        children: [
          { id: 'wifi-routers', name: 'TP-Link High Speed Routers', nameBn: 'টিপি-লিংক রাউটার', brand: 'TP-Link' },
          { id: 'wifi-routers', name: 'Tenda Dual Band Routers', nameBn: 'টেন্ডা রাউটার', brand: 'Tenda' },
          { id: 'wifi-routers', name: 'ASUS Gaming & Mesh Routers', nameBn: 'আসুস রাউটার', brand: 'Asus' },
          { id: 'wifi-routers', name: 'MikroTik Core Routers', nameBn: 'মিকরোটিক রাউটার', brand: 'MikroTik' },
        ],
      },
      { id: '4g-lte-router', name: '4G LTE SIM Routers', nameBn: '৪জি এলটিই রাউটার' },
      { id: 'mesh-wifi', name: 'Whole Home Mesh Wi-Fi', nameBn: 'মেশ ওয়াইফাই' },
      { id: 'network-switch', name: 'Gigabit & PoE Network Switches', nameBn: 'নেটওয়ার্ক সুইচ' },
      { id: 'onu-device', name: 'GPON / EPON Fiber ONU', nameBn: 'ওএনইউ / ফাইবার ডিভাইস' },
      { id: 'access-points', name: 'Access Points & Range Extenders', nameBn: 'অ্যাক্সেস পয়েন্ট' },
    ],
  },
  {
    id: 'software',
    name: 'Software',
    nameBn: 'সফটওয়্যার',
    icon: 'Terminal',
    image: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?q=80&w=600&auto=format&fit=crop',
    itemCount: 35,
    order: 3,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'windows-os', name: 'Windows 11 Pro Genuine License', nameBn: 'উইন্ডোজ ১১ প্রো' },
      { id: 'office-apps', name: 'Microsoft Office 365 Genuine', nameBn: 'অফিস ৩৬৫' },
      { id: 'antivirus', name: 'Antivirus & Internet Security (Kaspersky, ESET)', nameBn: 'অ্যান্টিভাইরাস' },
      { id: 'creative-software', name: 'Adobe Creative Cloud Genuine Subscription', nameBn: 'অ্যাডোবি সফটওয়্যার' },
      { id: 'server-os', name: 'Windows Server & SQL Database Licenses', nameBn: 'সার্ভার ওএস' },
    ],
  },
  {
    id: 'server',
    name: 'Server',
    nameBn: 'সার্ভার',
    icon: 'Server',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    itemCount: 42,
    order: 4,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'rack-servers', name: 'Rack & Tower Enterprise Servers (Dell, HPE)', nameBn: 'র‍্যাক সার্ভার' },
      { id: 'server-ram', name: 'ECC Registered Enterprise RAM', nameBn: 'সার্ভার র‍্যাম' },
      { id: 'server-storage', name: 'Enterprise SAS Server Drives', nameBn: 'এন্টারপ্রাইজ ড্রাইভ' },
      { id: 'server-accessories', name: 'Server Racks, Rails & Power Supplies', nameBn: 'সার্ভার এক্সেসরিজ' },
    ],
  },
  {
    id: 'storage',
    name: 'Storage',
    nameBn: 'স্টোরেজ',
    icon: 'Database',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=600&auto=format&fit=crop',
    itemCount: 88,
    order: 5,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'nas-storage', name: 'Synology & QNAP Network Attached Storage (NAS)', nameBn: 'ন্যাস স্টোরেজ' },
      { id: 'ssd-internal', name: 'M.2 NVMe & SATA SSDs', nameBn: 'এসএসডি' },
      { id: 'portable-ssd', name: 'High Speed Portable SSDs', nameBn: 'পোর্টেবল এসএসডি' },
      { id: 'hard-disk', name: 'Surveillance & Desktop Hard Drives (Seagate, WD)', nameBn: 'হার্ডডিস্ক ড্রাইভ' },
      { id: 'memory-cards', name: 'High Endurance MicroSD Cards', nameBn: 'মেমোরি কার্ড' },
    ],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    nameBn: 'এক্সেসরিজ',
    icon: 'Keyboard',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop',
    itemCount: 165,
    order: 6,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'keyboards', name: 'Mechanical & Wireless Keyboards', nameBn: 'কীবোর্ড' },
      { id: 'mouse', name: 'Wireless Ergonomic & Precision Mice', nameBn: 'মাউস' },
      { id: 'audio-headphone', name: 'Studio Headphones & Bluetooth Speakers', nameBn: 'হেডফোন ও অডিও' },
      { id: 'hubs-adapters', name: 'USB-C Hubs, Docks & DisplayPort Cables', nameBn: 'ইউএসবি হাব ও ক্যাবল' },
      { id: 'laptop-stand', name: 'Aluminum Laptop Stands & Cooling Pads', nameBn: 'ল্যাপটপ স্ট্যান্ড' },
      { id: 'backpacks', name: 'Waterproof Laptop Backpacks & Sleeves', nameBn: 'ল্যাপটপ ব্যাগ' },
    ],
  },
  {
    id: 'gadget',
    name: 'Gadgets',
    nameBn: 'গ্যাজেট',
    icon: 'Watch',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop',
    itemCount: 95,
    order: 7,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'smart-watch', name: 'Smart Watches (Apple Watch, Amazfit)', nameBn: 'স্মার্ট ওয়াচ' },
      { id: 'tws-earbuds', name: 'TWS Noise Cancelling Earbuds (AirPods, Galaxy Buds)', nameBn: 'টিডব্লিউএস ইয়ারবাডস' },
      { id: 'drones', name: 'DJI Camera Drones & Accessories', nameBn: 'ক্যামেরা ড্রোন' },
      { id: 'smart-lights', name: 'RGB Smart LED Strips & Desk Lights', nameBn: 'স্মার্ট লাইটিং' },
      { id: 'power-banks', name: 'Fast Charging 65W/100W Power Banks', nameBn: 'পাওয়ার ব্যাংক' },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    nameBn: 'গেমিং',
    icon: 'Gamepad2',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    itemCount: 120,
    order: 8,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'gaming-consoles', name: 'Gaming Consoles (Sony PS5 Slim, Xbox Series X, Switch OLED)', nameBn: 'গেমিং কনসোল' },
      { id: 'game-controllers', name: 'Wireless Gamepads & Racing Wheels', nameBn: 'গেমপ্যাড ও কন্ট্রোলার' },
      { id: 'gaming-chairs', name: 'Ergonomic Gaming Chairs & RGB Desks', nameBn: 'গেমিং চেয়ার ও ডেস্ক' },
      { id: 'gaming-peripherals', name: 'RGB Mechanical Keyboards & High DPI Mice', nameBn: 'গেমিং কীবোর্ড ও মাউস' },
      { id: 'gaming-audio', name: '7.1 Surround Gaming Headsets & Microphones', nameBn: 'গেমিং হেডসেট' },
      { id: 'gaming-streaming', name: 'Elgato Capture Cards & Stream Decks', nameBn: 'স্ট্রিমিং গিয়ার' },
    ],
  },
];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CATEGORIES_FILE)) {
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(INITIAL_CATEGORIES, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[Categories File Init Error]:', err);
  }
}

export function getLocalCategories(): any[] {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(CATEGORIES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function saveLocalCategories(categories: any[]): void {
  try {
    ensureDataFile();
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf8');
  } catch (err) {
    console.error('[Categories Save Local Error]:', err);
  }
}

/**
 * Seed initial categories to MongoDB if not present
 */
export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    await connectDB();
    if (!isDbConnected()) return;
    const count = await Category.countDocuments();
    if (count === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await Category.findOneAndUpdate(
          { id: cat.id },
          { $set: cat },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
      console.log(`[Categories Seed] Initialized ${INITIAL_CATEGORIES.length} categories in MongoDB.`);
    }
  } catch (err: any) {
    console.warn('[Categories Seed Notice]:', err.message);
  }
}

// GET /api/categories - List visible categories sorted by order (public)
categoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const showAll = req.query.all === 'true';
    await connectDB();

    if (isDbConnected()) {
      await seedCategoriesIfEmpty();
      const filter = showAll ? {} : { isVisible: true };
      const categories = await Category.find(filter).sort({ order: 1, createdAt: 1 }).lean();
      if (categories && categories.length > 0) {
        res.json({ success: true, source: 'mongodb', categories });
        return;
      }
    }

    const local = getLocalCategories();
    const filtered = showAll ? local : local.filter(c => c.isVisible !== false);
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ success: true, source: 'local_storage', categories: filtered });
  } catch (error: any) {
    console.error('[Categories GET Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// GET /api/categories/:id - Get single category
categoriesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await connectDB();

    if (isDbConnected()) {
      const cat = await Category.findOne({ id }).lean();
      if (cat) {
        res.json({ success: true, category: cat });
        return;
      }
    }

    const local = getLocalCategories();
    const found = local.find(c => c.id === id);
    if (found) {
      res.json({ success: true, category: found });
      return;
    }

    res.status(404).json({ success: false, error: 'Category not found' });
  } catch (error: any) {
    console.error('[Categories GET Single Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// POST /api/categories - Create category (Admin protected)
categoriesRouter.post('/', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.name) {
      res.status(400).json({ success: false, error: 'Category name is required.' });
      return;
    }

    const id = body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCategoryData = {
      id,
      name: body.name.trim(),
      nameBn: body.nameBn ? body.nameBn.trim() : body.name.trim(),
      icon: body.icon || 'Package',
      image: body.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      itemCount: Number(body.itemCount) || 0,
      order: Number(body.order) || 99,
      popular: !!body.popular,
      isVisible: body.isVisible !== undefined ? !!body.isVisible : true,
      subCategories: Array.isArray(body.subCategories) ? body.subCategories : [],
    };

    // Save to local file
    const local = getLocalCategories();
    const existingIdx = local.findIndex(c => c.id === id);
    if (existingIdx >= 0) {
      local[existingIdx] = { ...local[existingIdx], ...newCategoryData };
    } else {
      local.push(newCategoryData);
    }
    saveLocalCategories(local);

    // Save to MongoDB if connected
    let savedDoc: any = newCategoryData;
    await connectDB();
    if (isDbConnected()) {
      savedDoc = await Category.findOneAndUpdate(
        { id },
        { $set: newCategoryData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.status(201).json({ success: true, message: 'Category created successfully', category: savedDoc });
  } catch (error: any) {
    console.error('[Categories POST Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create category' });
  }
});

// PUT /api/categories/:id - Update category (Admin protected)
categoriesRouter.put('/:id', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;

    // Update in local file
    const local = getLocalCategories();
    const idx = local.findIndex(c => c.id === id);
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...updates, updatedAt: new Date().toISOString() };
      saveLocalCategories(local);
    }

    // Update in MongoDB
    let updatedMongo: any = null;
    await connectDB();
    if (isDbConnected()) {
      updatedMongo = await Category.findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: 'after', runValidators: true }
      );
    }

    const result = updatedMongo || (idx >= 0 ? local[idx] : null);
    if (result) {
      res.json({ success: true, message: 'Category updated successfully', category: result });
      return;
    }

    res.status(404).json({ success: false, error: 'Category not found' });
  } catch (error: any) {
    console.error('[Categories PUT Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Delete category (Admin protected)
categoriesRouter.delete('/:id', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    // Delete from local file
    const local = getLocalCategories();
    const filtered = local.filter(c => c.id !== id);
    if (filtered.length !== local.length) {
      saveLocalCategories(filtered);
    }

    // Delete from MongoDB
    await connectDB();
    if (isDbConnected()) {
      await Category.findOneAndDelete({ id });
    }

    res.json({ success: true, message: 'Category deleted successfully', categoryId: id });
  } catch (error: any) {
    console.error('[Categories DELETE Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to delete category' });
  }
});
