import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import mongoose from 'mongoose';
import { verifyAdminToken } from '../middleware/auth.ts';
import { connectDB, isDbConnected } from '../config/db.ts';

export const uploadRouter = Router();

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function saveMediaToDb(filename: string, mimetype: string, size: number, base64?: string) {
  try {
    await connectDB();
    if (isDbConnected() && mongoose.connection.db) {
      const updateData: any = {
        filename,
        mimetype,
        size,
        updatedAt: new Date(),
      };
      // Keep MongoDB documents under 12MB limit to strictly avoid BSON 16MB limit crashes
      if (base64 && size <= 12 * 1024 * 1024) {
        updateData.buffer = base64;
      }
      await mongoose.connection.db.collection('uploaded_media').updateOne(
        { filename },
        { $set: updateData },
        { upsert: true }
      );
    }
  } catch (err: any) {
    console.warn('[saveMediaToDb Notice]:', err.message);
  }
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const originalExt = path.extname(file.originalname).toLowerCase();
    const cleanExt = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif', '.jfif', '.bmp', '.ico'].includes(originalExt)
      ? originalExt
      : (file.mimetype === 'image/jpeg' ? '.jpg' : file.mimetype === 'image/webp' ? '.webp' : '.png');
    const safeName = `mc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
    cb(null, safeName);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();
  const isImageMime = mime.startsWith('image/');
  const isImageExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.jfif', '.bmp', '.ico'].includes(ext);

  if (isImageMime || isImageExt) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${file.mimetype || 'unknown'}). Please upload an image file.`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter,
});

/* ── POST /api/upload - Single/Multiple Image Upload (Admin protected) ── */
uploadRouter.post('/', verifyAdminToken, (req: Request, res: Response) => {
  // Check if payload is Base64 JSON (application/json)
  if (req.body && (req.body.base64Data || req.body.data || req.body.image)) {
    try {
      const raw = req.body.base64Data || req.body.data || req.body.image;
      if (typeof raw === 'string' && raw.includes('base64')) {
        let mimeType = 'image/webp';
        let base64 = raw;
        if (raw.includes(';base64,')) {
          const parts = raw.split(';base64,');
          mimeType = parts[0].replace('data:', '');
          base64 = parts[1];
        }

        const ext = mimeType.includes('png') ? '.png' : (mimeType.includes('jpeg') || mimeType.includes('jpg')) ? '.jpg' : '.webp';
        const cleanName = `mc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filePath = path.join(UPLOADS_DIR, cleanName);

        const buffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(filePath, buffer);

        const stats = fs.statSync(filePath);
        const dataUri = raw.includes(';base64,') ? raw : `data:${mimeType};base64,${base64}`;
        const fileUrl = `/uploads/${cleanName}`;

        saveMediaToDb(cleanName, mimeType, stats.size, base64).catch(e => console.warn('[Upload DB save error]:', e));

        return res.status(201).json({
          success: true,
          message: 'Image uploaded successfully',
          url: fileUrl,
          fileUrl,
          dataUri,
          filename: cleanName,
          size: stats.size,
          mimetype: mimeType,
        });
      }
    } catch (err: any) {
      console.error('[Base64 Upload Error]:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to process base64 upload' });
    }
  }

  // Handle standard Multipart Form Upload (supports single or multiple files with any field name: image, file, media, etc.)
  upload.any()(req, res, async (err: any) => {
    if (err) {
      console.error('[Multer Upload Error]:', err);
      const isLimit = err.code === 'LIMIT_FILE_SIZE';
      return res.status(400).json({
        success: false,
        error: isLimit ? 'File size exceeds 25MB limit. Please upload an optimized image.' : (err.message || 'Image upload failed'),
        code: err.code,
      });
    }

    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image file was received. Please select an image to upload.',
      });
    }

    try {
      const processed = [];
      for (const f of files) {
        const fileUrl = `/uploads/${f.filename}`;
        let dataUri = '';
        try {
          const buffer = fs.readFileSync(f.path);
          const base64 = buffer.toString('base64');
          dataUri = `data:${f.mimetype};base64,${base64}`;
          saveMediaToDb(f.filename, f.mimetype, f.size, base64).catch(e =>
            console.warn('[Upload DB save background notice]:', e.message)
          );
        } catch (e: any) {
          console.warn('[Upload read error]:', e.message);
        }

        processed.push({
          url: fileUrl,
          fileUrl,
          dataUri,
          filename: f.filename,
          size: f.size,
          mimetype: f.mimetype,
        });
      }

      const primary = processed[0];
      return res.status(201).json({
        success: true,
        message: processed.length > 1 ? `${processed.length} images uploaded successfully` : 'Image uploaded successfully',
        url: primary.fileUrl,
        fileUrl: primary.fileUrl,
        dataUri: primary.dataUri,
        filename: primary.filename,
        size: primary.size,
        mimetype: primary.mimetype,
        files: processed,
        urls: processed.map(p => p.fileUrl),
      });
    } catch (saveErr: any) {
      console.error('[Upload Post-process Error]:', saveErr);
      const primaryFile = files[0];
      const fallbackUrl = `/uploads/${primaryFile.filename}`;
      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        url: fallbackUrl,
        fileUrl: fallbackUrl,
        filename: primaryFile.filename,
        size: primaryFile.size,
        mimetype: primaryFile.mimetype,
      });
    }
  });
});

/**
 * Robust image file server:
 * 1. Checks local uploads/ folder
 * 2. Checks MongoDB uploaded_media collection
 * 3. Falls back to an SVG placeholder instead of a broken image
 */
export async function serveImageFile(req: Request, res: Response) {
  const rawParam = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filename = path.basename(String(rawParam || ''));
  const filePath = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // Fallback to MongoDB
  try {
    await connectDB();
    if (isDbConnected() && mongoose.connection.db) {
      const media = await mongoose.connection.db.collection('uploaded_media').findOne({ filename });
      if (media && (media.buffer || media.dataUri)) {
        const raw = media.buffer || (media.dataUri ? media.dataUri.split(';base64,')[1] : '');
        if (raw) {
          const buf = Buffer.from(raw, 'base64');
          res.setHeader('Content-Type', media.mimetype || 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.send(buf);
        }
      }
    }
  } catch (err) {
    console.warn('[serveImageFile DB error]:', err);
  }

  // Clean SVG placeholder fallback so <img> never breaks with "no image"
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="#f8fafc"/><rect x="40" y="40" width="320" height="220" rx="16" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/><text x="50%" y="48%" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#64748b" text-anchor="middle">My Computer BD</text><text x="50%" y="58%" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">100% Genuine Technology</text></svg>`);
}

uploadRouter.get('/file/:filename', serveImageFile);

/* ── GET /api/media - List all uploaded media files in the library ── */
uploadRouter.get('/media', async (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.json({ success: true, files: [] });
    }

    const entries = fs.readdirSync(UPLOADS_DIR);
    const files = entries
      .filter(f => !f.startsWith('.'))
      .map(filename => {
        const fullPath = path.join(UPLOADS_DIR, filename);
        try {
          const stat = fs.statSync(fullPath);
          const ext = path.extname(filename).toLowerCase();
          const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.svg' ? 'image/svg+xml' : 'image/webp';

          return {
            name: filename,
            filename,
            url: `/uploads/${filename}`,
            size: stat.size,
            date: (stat.birthtime || stat.mtime).toISOString(),
            createdAt: stat.birthtime || stat.mtime,
            mimetype: mime,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, count: files.length, files });
  } catch (err: any) {
    console.error('[List Media Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to list media library' });
  }
});

/* ── DELETE /api/media/:filename - Delete unused media item ── */
uploadRouter.delete('/media/:filename', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const rawFilename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
    const filename = path.basename(String(rawFilename || ''));
    const targetPath = path.join(UPLOADS_DIR, filename);

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      res.json({ success: true, message: 'Media file removed successfully', filename });
    } else {
      res.status(404).json({ success: false, error: 'Media file not found' });
    }
  } catch (err: any) {
    console.error('[Delete Media Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to delete media file' });
  }
});
