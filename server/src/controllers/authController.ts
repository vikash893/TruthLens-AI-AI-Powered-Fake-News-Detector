import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { config } from '../config';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required')
  })
});

export const googleAuthSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    googleId: z.string().optional(),
    avatar: z.string().optional()
  })
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: lowerEmail });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // If first user or email matches admin pattern, set role accordingly
    const totalUsers = await User.countDocuments();
    const role = (totalUsers === 0 || lowerEmail.includes('admin@truthlens.ai')) ? 'admin' : 'user';

    const user = await User.create({
      name,
      email: lowerEmail,
      passwordHash,
      role,
      isBlocked: false,
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

    // Log Activity
    await ActivityLog.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      category: 'AUTH',
      details: `User registered successfully with role '${user.role}'`,
      ipAddress: req.ip,
      status: 'SUCCESS'
    }).catch(err => logger.warn(`Log creation failed: ${err.message}`));

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
          avatar: user.avatar,
          preferences: user.preferences
        },
        token
      }
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const identifier = (email || '').toLowerCase().trim();

    // Check by email or name (case-insensitive) or quick aliases
    let user = await User.findOne({
      $or: [
        { email: identifier },
        { name: new RegExp(`^${identifier}$`, 'i') }
      ]
    });

    if (!user) {
      if (identifier === 'admin') {
        user = await User.findOne({ email: 'admin@truthlens.ai' });
      } else if (identifier === 'user') {
        user = await User.findOne({ email: 'user@truthlens.ai' });
      }
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email, username, or password.'
      });
      return;
    }

    if (user.isBlocked) {
      await ActivityLog.create({
        userId: user._id,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        action: 'BLOCKED_LOGIN_ATTEMPT',
        category: 'AUTH',
        details: 'Blocked user attempted to authenticate',
        ipAddress: req.ip,
        status: 'WARNING'
      }).catch(() => {});

      res.status(403).json({
        success: false,
        message: 'Your account has been suspended or blocked by an administrator.'
      });
      return;
    }

    if (!user.passwordHash) {
      res.status(400).json({
        success: false,
        message: 'This account was created with Google OAuth. Please use "Continue with Google".'
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

    // Log Activity
    await ActivityLog.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      category: 'AUTH',
      details: `User signed in successfully as '${user.role}'`,
      ipAddress: req.ip,
      status: 'SUCCESS'
    }).catch(err => logger.warn(`Log creation failed: ${err.message}`));

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
          avatar: user.avatar,
          preferences: user.preferences
        },
        token
      }
    });
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    const { email, name, googleId, avatar } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: lowerEmail });

    if (user) {
      if (user.isBlocked) {
        res.status(403).json({
          success: false,
          message: 'Your account has been suspended or blocked by an administrator.'
        });
        return;
      }
      if (googleId && !user.googleId) {
        user.googleId = googleId;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      await user.save();
    } else {
      const totalUsers = await User.countDocuments();
      const role = (totalUsers === 0 || lowerEmail.includes('admin@truthlens.ai')) ? 'admin' : 'user';

      user = await User.create({
        name: name || lowerEmail.split('@')[0],
        email: lowerEmail,
        googleId: googleId || `google_${Date.now()}`,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${lowerEmail}`,
        role,
        isBlocked: false,
        preferences: { theme: 'system', emailNotifications: false }
      });
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

    await ActivityLog.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'GOOGLE_OAUTH_LOGIN',
      category: 'AUTH',
      details: `User authenticated via Google OAuth (${user.role})`,
      ipAddress: req.ip,
      status: 'SUCCESS'
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Google authentication successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
          avatar: user.avatar,
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
          isBlocked: req.user.isBlocked,
          avatar: req.user.avatar,
          preferences: req.user.preferences,
          savedReportsCount: req.user.savedReports?.length || 0
        }
      }
    });
  }
}

export const authController = new AuthController();
