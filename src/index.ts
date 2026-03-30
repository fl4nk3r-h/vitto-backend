import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectPostgres } from './db/postgres';
import { connectMongo } from './db/mongo';
import { authRouter } from './routes/auth';
import { leadsRouter } from './routes/leads';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000');

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limit — 100 requests per 15 min per IP
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
}));


// ── Routes ──────────────────────────────────────────────────────────────────

// Default root route: show available API endpoints
app.get('/', (_req, res) => {
  res.send(`
    <html>
      <head>
        <title>Vitto API</title>
        <style>
          body { font-family: sans-serif; background: #f8f9fa; color: #222; padding: 2rem; }
          h1 { color: #D32F2F; }
          ul { line-height: 1.7; }
          code { background: #eee; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Vitto API</h1>
        <p>Welcome to the Vitto backend API. Available endpoints:</p>
        <ul>
          <li><code>GET /health</code> — Health check</li>
          <li><code>POST /api/auth/send-otp</code> — Request OTP</li>
          <li><code>POST /api/auth/verify-otp</code> — Verify OTP</li>
          <li><code>POST /api/leads</code> — Create new lead (auth required)</li>
          <li><code>GET /api/leads/:id</code> — Get lead by ID (auth required)</li>
        </ul>
        <p>See <a href="/docs">/docs</a> for more info.</p>
      </body>
    </html>
  `);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Boot ────────────────────────────────────────────────────────────────────

async function start() {
  try {
    await connectPostgres();
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`[server] Vitto API running on http://localhost:${PORT}`);
      console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
}

start();
