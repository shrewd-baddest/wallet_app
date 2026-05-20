import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import logger from './utils/logger';
import errorHandler from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import transactionRoutes from './modules/transactions/transactions.routes';
import transferRoutes from './modules/transfers/transfers.routes';
import mpesaRoutes from './modules/mpesa/mpesa.routes';
import adminRoutes from './modules/admin/admin.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP logging ───────────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg: string) => logger.http(msg.trim()) },
    skip: () => process.env.NODE_ENV === 'test',
  })
);

// ── Global rate limiter ────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many auth attempts, please wait.' },
  })
);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

export default app;
