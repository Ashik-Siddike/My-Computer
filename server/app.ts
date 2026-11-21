import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { ordersRouter } from './routes/orders.ts';
import { productsRouter } from './routes/products.ts';
import { categoriesRouter } from './routes/categories.ts';
import { adminRouter } from './routes/admin.ts';
import { authRouter } from './routes/auth.ts';
import { seedRouter } from './routes/seed.ts';
import { cardsRouter } from './routes/cards.ts';
import { uploadRouter, serveImageFile } from './routes/upload.ts';
import { settingsRouter } from './routes/settings.ts';
import { isDbConnected } from './config/db.ts';

export const app = express();

// Static directory for uploaded product and brand images with MongoDB fallback
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));
app.get('/uploads/:filename', serveImageFile);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, health checks or tools without origin (e.g. curl, render healthcheck)
    if (!origin) return callback(null, true);
    // Allow all Vercel deployments (*.vercel.app), Render (*.onrender.com), and local dev
    if (
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    // Allow custom frontend domain or fallback
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check & Database Status for Render / Uptime Monitoring
const healthCheckHandler = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'My Computer E-Commerce Backend API',
    databaseConnected: isDbConnected(),
    timestamp: new Date().toISOString(),
  });
};
app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);

// Mount Routes
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api', uploadRouter); // for /api/media
app.use('/api/settings', settingsRouter);
app.use('/api', seedRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
