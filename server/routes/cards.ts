import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, isDbConnected } from '../config/db.ts';
import { SiteCard } from '../models/SiteCard.ts';
import { verifyAdminToken, type AuthenticatedRequest } from '../middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const CARDS_FILE = path.resolve(DATA_DIR, 'cards.json');

export const cardsRouter = Router();

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CARDS_FILE)) {
      fs.writeFileSync(CARDS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[Cards File Init Error]:', err);
  }
}

export function getLocalCards(): any[] {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(CARDS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalCards(cards: any[]): void {
  try {
    ensureDataFile();
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2), 'utf8');
  } catch (err) {
    console.error('[Cards Save Local Error]:', err);
  }
}

/**
 * Seed initial cards to MongoDB if empty, pulling from cards.json
 */
export async function seedCardsIfEmpty(): Promise<void> {
  try {
    await connectDB();
    if (!isDbConnected()) return;
    const count = await SiteCard.countDocuments();
    const localCards = getLocalCards();
    if (count === 0 && localCards.length > 0) {
      for (const card of localCards) {
        await SiteCard.findOneAndUpdate(
          { id: card.id },
          { $set: card },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
      }
      console.log(`[Cards Seed] Initialized ${localCards.length} cards in MongoDB.`);
    }
  } catch (err: any) {
    console.warn('[Cards Seed Notice]:', err.message);
  }
}

// Automatically seed on boot
seedCardsIfEmpty().catch(() => {});

// -------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------

/**
 * GET /api/cards
 * Returns all active (visible & published) cards for frontend display
 * Supports filter: ?section=homepage-hero
 */
cardsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { section, device } = req.query;
    const query: any = { isVisible: true, status: 'published' };

    if (section && typeof section === 'string') {
      query.section = section;
    }

    if (isDbConnected()) {
      let filterQuery = { ...query };
      if (device && typeof device === 'string') {
        filterQuery.$or = [{ targetDevice: 'all' }, { targetDevice: device }];
      }
      const cards = await SiteCard.find(filterQuery).sort({ displayOrder: 1, createdAt: 1 }).lean();
      return res.json({ success: true, count: cards.length, data: cards });
    }

    // Local JSON fallback
    let cards = getLocalCards().filter(c => c.isVisible !== false && c.status !== 'draft');
    if (section && typeof section === 'string') {
      cards = cards.filter(c => c.section === section);
    }
    if (device && typeof device === 'string') {
      cards = cards.filter(c => !c.targetDevice || c.targetDevice === 'all' || c.targetDevice === device);
    }
    cards.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return res.json({ success: true, count: cards.length, data: cards });
  } catch (err: any) {
    console.error('[Get Cards Error]:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to retrieve cards' });
  }
});

/**
 * GET /api/cards/sections
 * Returns unique section statistics
 */
cardsRouter.get('/sections', async (_req: Request, res: Response) => {
  try {
    let allCards: any[] = [];
    if (isDbConnected()) {
      allCards = await SiteCard.find().lean();
    } else {
      allCards = getLocalCards();
    }

    const sectionsMap: Record<string, { count: number; activeCount: number }> = {};
    for (const card of allCards) {
      const s = card.section || 'custom';
      if (!sectionsMap[s]) sectionsMap[s] = { count: 0, activeCount: 0 };
      sectionsMap[s].count++;
      if (card.isVisible && card.status === 'published') {
        sectionsMap[s].activeCount++;
      }
    }

    return res.json({ success: true, sections: sectionsMap, total: allCards.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN ENDPOINTS (Protected with verifyAdminToken)
// -------------------------------------------------------------

/**
 * GET /api/cards/all
 * Returns all cards including drafts and hidden ones
 */
cardsRouter.get('/all', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const { section, status, search } = req.query;
    
    if (isDbConnected()) {
      const filter: any = {};
      if (section && typeof section === 'string' && section !== 'all') {
        filter.section = section;
      }
      if (status && typeof status === 'string' && status !== 'all') {
        if (status === 'visible') filter.isVisible = true;
        else if (status === 'hidden') filter.isVisible = false;
        else if (status === 'draft') filter.status = 'draft';
        else if (status === 'published') filter.status = 'published';
      }
      if (search && typeof search === 'string' && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { name: regex },
          { id: regex },
          { title: regex },
          { subtitle: regex },
          { badge: regex },
        ];
      }

      const cards = await SiteCard.find(filter).sort({ section: 1, displayOrder: 1, createdAt: -1 }).lean();
      return res.json({ success: true, count: cards.length, data: cards });
    }

    // Local JSON fallback
    let cards = getLocalCards();
    if (section && typeof section === 'string' && section !== 'all') {
      cards = cards.filter(c => c.section === section);
    }
    if (status && typeof status === 'string' && status !== 'all') {
      if (status === 'visible') cards = cards.filter(c => c.isVisible === true);
      else if (status === 'hidden') cards = cards.filter(c => c.isVisible === false);
      else if (status === 'draft') cards = cards.filter(c => c.status === 'draft');
      else if (status === 'published') cards = cards.filter(c => c.status === 'published');
    }
    if (search && typeof search === 'string' && search.trim()) {
      const s = search.toLowerCase().trim();
      cards = cards.filter(
        c =>
          c.name?.toLowerCase().includes(s) ||
          c.id?.toLowerCase().includes(s) ||
          c.title?.toLowerCase().includes(s) ||
          c.subtitle?.toLowerCase().includes(s) ||
          c.badge?.toLowerCase().includes(s)
      );
    }

    cards.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return res.json({ success: true, count: cards.length, data: cards });
  } catch (err: any) {
    console.error('[Admin Get All Cards Error]:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to retrieve admin cards' });
  }
});

/**
 * GET /api/cards/:id
 * Single card lookup
 */
cardsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const card = await SiteCard.findOne({ id }).lean();
      if (card) return res.json({ success: true, data: card });
    }

    const localCards = getLocalCards();
    const card = localCards.find(c => c.id === id);
    if (!card) {
      return res.status(404).json({ success: false, error: `Card '${id}' not found` });
    }
    return res.json({ success: true, data: card });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/cards
 * Create a new card or duplicate an existing one
 */
cardsRouter.post('/', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cardData = req.body;
    if (!cardData.name || !cardData.title || !cardData.section) {
      return res.status(400).json({
        success: false,
        error: 'Card name, title, and section are required fields.',
      });
    }

    // Generate clean unique ID if not provided or exists
    let cardId = (cardData.id || `${cardData.section}-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    if (isDbConnected()) {
      const existing = await SiteCard.findOne({ id: cardId });
      if (existing) {
        cardId = `${cardId}-${Date.now().toString().slice(-4)}`;
      }
      cardData.id = cardId;
      const newCard = new SiteCard(cardData);
      await newCard.save();

      // Mirror to local JSON
      const localCards = getLocalCards();
      localCards.push(newCard.toObject());
      saveLocalCards(localCards);

      return res.status(201).json({ success: true, message: 'Card created successfully', data: newCard });
    }

    // Local JSON
    const localCards = getLocalCards();
    const existingIndex = localCards.findIndex(c => c.id === cardId);
    if (existingIndex >= 0) {
      cardId = `${cardId}-${Date.now().toString().slice(-4)}`;
    }
    cardData.id = cardId;
    cardData.createdAt = new Date().toISOString();
    cardData.updatedAt = new Date().toISOString();
    localCards.push(cardData);
    saveLocalCards(localCards);

    return res.status(201).json({ success: true, message: 'Card created in local store', data: cardData });
  } catch (err: any) {
    console.error('[Create Card Error]:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to create card' });
  }
});

/**
 * PUT /api/cards/:id
 * Full card update
 */
cardsRouter.put('/:id', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    delete updateData._id;
    delete updateData.id; // Prevent slug mutation

    updateData.updatedAt = new Date();

    if (isDbConnected()) {
      const updated = await SiteCard.findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: 'after', runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: `Card '${id}' not found` });
      }

      // Mirror update to local JSON
      const localCards = getLocalCards();
      const idx = localCards.findIndex(c => c.id === id);
      if (idx >= 0) {
        localCards[idx] = { ...localCards[idx], ...updated.toObject() };
      } else {
        localCards.push(updated.toObject());
      }
      saveLocalCards(localCards);

      return res.json({ success: true, message: 'Card updated successfully', data: updated });
    }

    // Local JSON
    const localCards = getLocalCards();
    const idx = localCards.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Card '${id}' not found in local store` });
    }

    localCards[idx] = {
      ...localCards[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    saveLocalCards(localCards);

    return res.json({ success: true, message: 'Card updated in local store', data: localCards[idx] });
  } catch (err: any) {
    console.error('[Update Card Error]:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update card' });
  }
});

/**
 * DELETE /api/cards/:id
 * Delete a card
 */
cardsRouter.delete('/:id', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await SiteCard.findOneAndDelete({ id });
      if (!deleted) {
        return res.status(404).json({ success: false, error: `Card '${id}' not found` });
      }

      // Mirror to local JSON
      let localCards = getLocalCards();
      localCards = localCards.filter(c => c.id !== id);
      saveLocalCards(localCards);

      return res.json({ success: true, message: `Card '${id}' deleted successfully` });
    }

    // Local JSON
    let localCards = getLocalCards();
    const beforeCount = localCards.length;
    localCards = localCards.filter(c => c.id !== id);
    if (localCards.length === beforeCount) {
      return res.status(404).json({ success: false, error: `Card '${id}' not found in local store` });
    }
    saveLocalCards(localCards);

    return res.json({ success: true, message: `Card '${id}' deleted from local store` });
  } catch (err: any) {
    console.error('[Delete Card Error]:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete card' });
  }
});

/**
 * POST /api/cards/reorder
 * Bulk update display orders
 */
cardsRouter.post('/reorder', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orders } = req.body; // Array of { id: string, order: number }
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, error: 'Orders must be an array of { id, order }' });
    }

    if (isDbConnected()) {
      const bulkOps = orders.map(item => ({
        updateOne: {
          filter: { id: item.id },
          update: { $set: { displayOrder: item.order, updatedAt: new Date() } },
        },
      }));
      await SiteCard.bulkWrite(bulkOps);

      // Mirror to local JSON
      const localCards = getLocalCards();
      orders.forEach(item => {
        const card = localCards.find(c => c.id === item.id);
        if (card) card.displayOrder = item.order;
      });
      saveLocalCards(localCards);

      return res.json({ success: true, message: 'Card order updated successfully' });
    }

    // Local JSON
    const localCards = getLocalCards();
    orders.forEach(item => {
      const card = localCards.find(c => c.id === item.id);
      if (card) card.displayOrder = item.order;
    });
    saveLocalCards(localCards);

    return res.json({ success: true, message: 'Card order updated in local store' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
