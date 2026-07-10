import express from 'express';
import app from './src/express-app';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Setup support for ES/CommonJS directory references
const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    // Falls back to global __dirname in CommonJS context
    return __dirname;
  }
};

const appDir = getDirname();

async function startServer() {
  // Serve the built React frontend as static files in production
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.resolve(appDir, './dist/client');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  } else {
    // In development, load Vite and hook it up as Express middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Start the server and handle any bootstrap failures
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
