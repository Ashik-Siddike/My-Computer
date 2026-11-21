import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { verifyAdminToken } from '../middleware/auth.ts';

export const uploadRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const cleanExt = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext) ? ext : '.png';
    const safeName = `mc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
    cb(null, safeName);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WebP, GIF, and SVG are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

/* ── POST /api/upload - Single/Multiple Image Upload (Admin protected) ── */
uploadRouter.post('/', verifyAdminToken, (req: Request, res: Response) => {
  // Check if payload is Base64 JSON
  if (req.body && (req.body.base64Data || req.body.data)) {
    try {
      const raw = req.body.base64Data || req.body.data;
      
      let mimeType = 'image/webp';
      let base64 = raw;
      if (raw.includes(';base64,')) {
        const parts = raw.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        base64 = parts[1];
      }

      const ext = mimeType.includes('png') ? '.png' : mimeType.includes('jpeg') || mimeType.includes('jpg') ? '.jpg' : '.webp';
      const cleanName = `mc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(UPLOADS_DIR, cleanName);

      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(filePath, buffer);

      const stats = fs.statSync(filePath);
      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        url: `/uploads/${cleanName}`,
        filename: cleanName,
        size: stats.size,
        mimetype: mimeType,
      });
    } catch (err: any) {
      console.error('[Base64 Upload Error]:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to process base64 upload' });
    }
  }

  // Handle standard Multipart Form Upload
  const uploadSingle = upload.single('image');
  uploadSingle(req, res, (err: any) => {
    if (err) {
      console.error('[Multer Upload Error]:', err);
      return res.status(400).json({ success: false, error: err.message || 'Image upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});

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
