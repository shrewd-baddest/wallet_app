import 'dotenv/config';
import app from './app';
import db from './db';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

const start = async (): Promise<void> => {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ Database connected');

    app.listen(PORT, () => {
      logger.info(`🚀 MVP Wallet API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', (err as Error).message);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down gracefully');
  await db.destroy();
  process.exit(0);
});

process.on('unhandledRejection', async (reason) => {
  logger.error(`Unhandled Rejection: ${
    (reason as Error)?.message || String(reason)
  }`);
  try {
    await db.destroy();
  } catch (_) {}
  process.exit(1);
});

process.on('uncaughtException', async (err) => {
  logger.error(`Uncaught Exception: ${(err as Error).message}`);
  try {
    await db.destroy();
  } catch (_) {}
  process.exit(1);
});

start();
