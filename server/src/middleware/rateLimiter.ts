import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const generalLimiter = rateLimit({
  windowMs: config.rateLimits.generalWindowMs,
  max: config.rateLimits.generalMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimits.authWindowMs,
  max: config.rateLimits.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

export const analysisLimiter = rateLimit({
  windowMs: config.rateLimits.analysisWindowMs,
  max: config.rateLimits.analysisMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Analysis submission rate limit reached. Please wait before analyzing more content.'
  }
});
