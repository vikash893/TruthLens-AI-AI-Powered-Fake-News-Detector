import bcrypt from 'bcryptjs';
import { createApp } from './app';
import { config } from './config';
import { connectDatabase } from './config/database';
import { User } from './models/User';
import { logger } from './utils/logger';

const seedInitialUsers = async () => {
  try {
    const adminEmail = 'admin@truthlens.ai';
    const userEmail = 'user@truthlens.ai';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Admin@123', salt);
      await User.create({
        name: 'Chief Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isBlocked: false,
        preferences: { theme: 'system', emailNotifications: true }
      });
      logger.info(`Default Admin seeded: ${adminEmail} (password: Admin@123)`);
    }

    const existingUser = await User.findOne({ email: userEmail });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('User@123', salt);
      await User.create({
        name: 'Alex Johnson',
        email: userEmail,
        passwordHash,
        role: 'user',
        isBlocked: false,
        preferences: { theme: 'system', emailNotifications: false }
      });
      logger.info(`Default Test User seeded: ${userEmail} (password: User@123)`);
    }
  } catch (err: any) {
    logger.warn(`Database seeding notice: ${err.message}`);
  }
};

const startServer = async () => {
  try {
    await connectDatabase();
    await seedInitialUsers();

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
