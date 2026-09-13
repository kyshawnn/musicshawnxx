// Set VERCEL environment variable flag so server.ts knows it's executing in serverless
process.env.VERCEL = process.env.VERCEL || '1';

import app from '../server';

export default function handler(req: any, res: any) {
  // If invoked via Vercel dynamic catch-all route api/[...path].ts
  if (Array.isArray(req.query?.path)) {
    const subpath = req.query.path.join('/');
    const urlObj = new URL(req.url, 'http://localhost');
    req.url = `/api/${subpath}${urlObj.search}`;
  } else {
    // If Vercel rewrote to index.ts, recover original matched path if available
    const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
    if (matchedPath && typeof matchedPath === 'string' && matchedPath.startsWith('/api')) {
      const urlObj = new URL(req.url, 'http://localhost');
      req.url = `${matchedPath}${urlObj.search}`;
    }
  }

  // Ensure /api prefix is present so Express routes (/api/*) always match
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  return app(req, res);
}

