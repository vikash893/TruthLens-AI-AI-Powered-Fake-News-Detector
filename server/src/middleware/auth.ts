import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
  isGuest?: boolean;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access this resource.'
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Session invalid or user no longer exists.'
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    req.isGuest = false;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (user) {
          req.user = user;
          req.userId = user._id.toString();
          req.isGuest = false;
        }
      } catch (err) {
        // Token invalid, proceed as guest
        req.isGuest = true;
      }
    } else {
      req.isGuest = true;
    }
    next();
  } catch (err) {
    req.isGuest = true;
    next();
  }
};
