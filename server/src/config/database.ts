import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    logger.info(`Connected to MongoDB at ${config.mongoUri}`);
  } catch (err: any) {
    logger.warn(`Could not connect to MongoDB at ${config.mongoUri} (${err.message}).`);
    logger.warn('Please ensure MongoDB is running (e.g. `docker run -d -p 27017:27017 --name mongo-truthlens mongo:latest` or local service).');
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    logger.info('Database disconnected.');
  } catch (err) {
    logger.error('Error during database disconnection:', err);
  }
};
