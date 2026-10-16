import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

export const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (
          origin === config.clientUrl ||
          origin === 'http://localhost:5173' ||
          origin === 'http://127.0.0.1:5173' ||
          origin.startsWith('http://localhost:')
        ) {
          return callback(null, true);
        }
        callback(null, true); // Permissive in dev, tighten in production
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // General rate limiter
  app.use(generalLimiter);

  // Operational health checks
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      app: 'TruthLens AI Backend',
      environment: config.env,
      timestamp: new Date().toISOString()
    });
  });

  // Versioned API Routes
  app.use('/api/v1', apiRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
