import app from './app.ts';
import { connectDB } from './config/db.ts';
import { runDatabaseSeed } from './routes/seed.ts';
import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // Attempt database connection & seeding
    await connectDB();
    await runDatabaseSeed(false);
  } catch (error: any) {
    console.warn('[Server] Initial DB connection failed (check your MONGODB_URI in .env):', error.message);
  }

  // Serve static dist folder in production standalone mode
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health' || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(` My Computer Server running on port ${PORT}`);
    console.log(` API Endpoints active at /api`);
    console.log(` Healthcheck active at /health and /api/health`);
    console.log(`=================================================`);
  });

  // Graceful shutdown handling for Render zero-downtime deploys
  const handleShutdown = (signal: string) => {
    console.log(`[Server] Received ${signal}. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer();
