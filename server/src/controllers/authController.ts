import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { config } from '../config';
import { AuthenticatedRequest } from '../middleware/auth';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'user',
      preferences: { theme: 'system', emailNotifications: false }
    });

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences
        },
        token
      }
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences
        },
        token
      }
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          preferences: req.user.preferences,
          savedReportsCount: req.user.savedReports?.length || 0
        }
      }
    });
  }
}

export const authController = new AuthController();
