import app from './app.js';
import logger from './utils/logger.js';
import { connectDatabase } from './config/database.js';
import { initializeRedis } from './config/redis.js';
import { startScheduler } from './jobs/scheduler.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    logger.info('Connecting to database...');
    await connectDatabase();
    logger.info('✓ Database connected');

    // Initialize Redis
    logger.info('Connecting to Redis...');
    await initializeRedis();
    logger.info('✓ Redis connected');

    // Start scheduler
    if (process.env.FEATURE_AUTO_ALPA === 'true') {
      logger.info('Starting scheduler...');
      await startScheduler();
      logger.info('✓ Scheduler started');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
