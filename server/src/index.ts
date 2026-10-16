import { createApp } from './app';
import { config } from './config';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    await connectDatabase();

    const app = createApp();
    app.listen(config.port, () => {
      logger.info(`TruthLens AI server listening on port ${config.port} (${config.env})`);
      logger.info(`API Base URL: http://localhost:${config.port}/api/v1`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
    });
  } catch (err: any) {
    logger.error('Failed to start TruthLens AI server:', err.message || err);
    process.exit(1);
  }
};

startServer();
