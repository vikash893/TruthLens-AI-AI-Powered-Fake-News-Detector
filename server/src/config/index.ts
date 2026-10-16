import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/truthlens',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-jwt-truthlens-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  internalApiSecret: process.env.INTERNAL_API_SECRET || 'dev-secret-internal-truthlens',
  maxUploadSizeBytes: 10 * 1024 * 1024, // 10 MB
  rateLimits: {
    generalWindowMs: 15 * 60 * 1000,
    generalMax: 100,
    authWindowMs: 15 * 60 * 1000,
    authMax: 15,
    analysisWindowMs: 15 * 60 * 1000,
    analysisMax: 30
  }
};
