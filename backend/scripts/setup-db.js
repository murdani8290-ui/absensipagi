#!/usr/bin/env node
import 'dotenv/config';
import { connectDatabase } from '../src/config/database.js';
import { runMigrations } from '../src/database/migrations.js';
import { seedDatabase } from '../src/database/seed.js';
import logger from '../src/utils/logger.js';

async function main() {
  try {
    logger.info('🚀 Starting database setup...');

    // Connect to database
    await connectDatabase();
    logger.info('✓ Connected to database');

    // Run migrations
    await runMigrations();

    // Seed database
    await seedDatabase();

    logger.info('✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

main();
