import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { connectDB, isDbConnected } from '../config/db.ts';
import { SiteSettings } from '../models/SiteSettings.ts';
import { verifyAdminToken } from '../middleware/auth.ts';

export const settingsRouter = Router();

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  navbar: {
    logoUrl: '',
    logoHeight: 42,
    brandName: 'MY COMPUTER',
    tagline: 'Leading Tech Retailer',
    hotline: '16789',
  },
  cardAppearance: {
    imageRatio: '4/3',
    borderRadius: 'rounded-2xl',
    shadow: 'shadow-xs',
    hoverEffect: 'tilt',
    showSpecs: true,
    showWarrantyBadge: true,
  },
  homepageSections: [
    { id: 'hero-slider', name: 'Hero Banner Slider', title: '', subtitle: '', isVisible: true, order: 1 },
    { id: 'category-grid', name: 'Featured Categories Grid', title: 'Featured Categories', subtitle: 'Explore genuine technology components', isVisible: true, order: 2 },
    { id: 'best-sellers', name: 'Best-Selling Hardware', title: 'Best-Selling Hardware & Tech', subtitle: 'Curated enterprise & consumer hardware with verified official warranty', isVisible: true, order: 3 },
    { id: 'ezviz-cameras', name: 'EZVIZ Smart Cameras Showcase', title: 'Smart Home & AI Cameras', subtitle: 'Leading surveillance technology', isVisible: true, order: 4 },
    { id: 'featured-products', name: 'Category Highlights', title: 'Explore Premium Tech', subtitle: 'Curated by department', isVisible: true, order: 5 },
    { id: 'networking', name: 'High-Speed Networking', title: 'High-Speed Networking & Wi-Fi 6', subtitle: 'Gigabit routers and fiber solutions', isVisible: true, order: 6 },
    { id: 'gaming-zone', name: 'Gaming Zone & High FPS Gear', title: 'Esports Gaming Gear', subtitle: 'Top tier mechanical gear', isVisible: true, order: 7 },
  ],
  footer: {
    aboutText: 'My Computer is Bangladesh’s premier technology destination. We deliver top-tier Smart Cameras, Enterprise Networking, Licensed Software, Servers, High-Speed Storage, Accessories, Gadgets & Gaming Gear with unmatched official warranty support.',
    hotline: '16789 / +880 9678-000111',
    email: 'support@mycomputer.com.bd',
    showAcceptedPayments: false, // Explicitly removed from public footer as requested
    tradeLicense: 'TRAD/DNCC/024881/2023',
    copyright: 'My Computer BD Ltd. All Rights Reserved.',
  },
};

function ensureSettingsFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[Settings File Init Error]:', err);
  }
}

export function getLocalSettings(): typeof DEFAULT_SETTINGS {
  try {
    ensureSettingsFile();
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveLocalSettings(settings: any): void {
  try {
    ensureSettingsFile();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('[Save Local Settings Error]:', err);
  }
}

/* ── GET /api/settings - Fetch current site settings ── */
settingsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    await connectDB();
    if (isDbConnected()) {
      const doc = await SiteSettings.findOne().lean();
      if (doc) {
        return res.json({ success: true, settings: doc });
      }
    }

    const local = getLocalSettings();
    return res.json({ success: true, settings: local, source: 'local' });
  } catch (err: any) {
    console.error('[Get Settings Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch settings' });
  }
});

/* ── PUT /api/settings - Update site settings (Admin Protected) ── */
settingsRouter.put('/', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const updates = req.body || {};
    const local = getLocalSettings();
    const merged = {
      navbar: { ...local.navbar, ...(updates.navbar || {}) },
      cardAppearance: { ...local.cardAppearance, ...(updates.cardAppearance || {}) },
      homepageSections: updates.homepageSections || local.homepageSections,
      footer: { ...local.footer, ...(updates.footer || {}) },
      updatedAt: new Date(),
    };

    saveLocalSettings(merged);

    await connectDB();
    let savedDoc: any = merged;
    if (isDbConnected()) {
      try {
        savedDoc = await SiteSettings.findOneAndUpdate(
          {},
          { $set: merged },
          { upsert: true, returnDocument: 'after', runValidators: true }
        );
      } catch (dbErr: any) {
        console.warn('[DB Settings Update Warning]:', dbErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Website settings updated successfully',
      settings: savedDoc,
    });
  } catch (err: any) {
    console.error('[Update Settings Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to update settings' });
  }
});
