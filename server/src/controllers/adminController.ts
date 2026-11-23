import { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Analysis } from '../models/Analysis';
import { Claim } from '../models/Claim';
import { ActivityLog } from '../models/ActivityLog';
import { logger } from '../utils/logger';

export class AdminController {
  // 1. Dashboard Metrics
  async getMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        blockedUsers,
        adminUsers,
        totalAnalyses,
        totalClaims,
        claimStatusCounts,
        recentAnalysesCount
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isBlocked: true }),
        User.countDocuments({ role: 'admin' }),
        Analysis.countDocuments(),
        Claim.countDocuments(),
        Claim.aggregate([
          { $group: { _id: '$assessmentStatus', count: { $sum: 1 } } }
        ]),
        Analysis.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
      ]);

      const activeUsers = totalUsers - blockedUsers;

      const distribution: Record<string, number> = {
        SUPPORTED: 0,
        REFUTED: 0,
        MIXED: 0,
        INSUFFICIENT_EVIDENCE: 0,
        OUT_OF_CONTEXT: 0,
        NOT_VERIFIABLE: 0
      };

      for (const item of claimStatusCounts) {
        if (distribution[item._id] !== undefined) {
          distribution[item._id] = item.count;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalUsers,
            activeUsers,
            blockedUsers,
            adminUsers,
            totalAnalyses,
            totalClaims,
            recentAnalyses24h: recentAnalysesCount,
            refutedFakeCount: distribution.REFUTED,
            supportedGoodCount: distribution.SUPPORTED,
            mixedCount: distribution.MIXED + distribution.OUT_OF_CONTEXT,
            insufficientCount: distribution.INSUFFICIENT_EVIDENCE + distribution.NOT_VERIFIABLE
          },
          distribution
        }
      });
    } catch (err: any) {
      logger.error(`Error in admin getMetrics: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to retrieve admin metrics.' });
    }
  }

  // 2. User Management: List Users with Stats
  async listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const filter = (req.query.filter as string) || 'all';

      let query: any = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (filter === 'blocked') query.isBlocked = true;
      else if (filter === 'active') query.isBlocked = false;
      else if (filter === 'admin') query.role = 'admin';

      const users = await User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .lean();

      // Aggregate user analysis count
      const userIds = users.map(u => u._id);
      const analysisCounts = await Analysis.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ]);

      const countMap = new Map<string, number>();
      for (const ac of analysisCounts) {
        countMap.set(ac._id.toString(), ac.count);
      }

      const enriched = users.map(u => ({
        ...u,
        id: u._id,
        analysisCount: countMap.get(u._id.toString()) || 0
      }));

      res.status(200).json({
        success: true,
        data: { users: enriched }
      });
    } catch (err: any) {
      logger.error(`Error in admin listUsers: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
  }

  // 3. User Management: Block / Unblock User
  async toggleBlockStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid user ID.' });
        return;
      }

      if (req.user && req.user._id.toString() === id) {
        res.status(400).json({ success: false, message: 'Administrators cannot block their own account.' });
        return;
      }

      const updated = await User.findByIdAndUpdate(
        id,
        { isBlocked: Boolean(isBlocked) },
        { new: true }
      ).select('-passwordHash');

      if (!updated) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      // Log action
      await ActivityLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || 'admin',
        userName: req.user?.name || 'Administrator',
        userRole: 'admin',
        action: isBlocked ? 'ADMIN_BLOCKED_USER' : 'ADMIN_UNBLOCKED_USER',
        category: 'USER_MANAGEMENT',
        details: `Administrator ${isBlocked ? 'blocked' : 'unblocked'} user ${updated.email}`,
        metadata: { targetUserId: updated._id, targetEmail: updated.email },
        status: 'SUCCESS'
      });

      res.status(200).json({
        success: true,
        message: `User ${updated.email} has been ${isBlocked ? 'blocked' : 'unblocked'}.`,
        data: { user: updated }
      });
    } catch (err: any) {
      logger.error(`Error in toggleBlockStatus: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to update user status.' });
    }
  }

  // 4. User Management: Delete User
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid user ID.' });
        return;
      }

      if (req.user && req.user._id.toString() === id) {
        res.status(400).json({ success: false, message: 'Administrators cannot delete their own account.' });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      await User.findByIdAndDelete(id);

      await ActivityLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || 'admin',
        userName: req.user?.name || 'Administrator',
        userRole: 'admin',
        action: 'ADMIN_DELETED_USER',
        category: 'USER_MANAGEMENT',
        details: `Administrator permanently deleted user ${user.email} (${user.name})`,
        metadata: { targetUserId: user._id, targetEmail: user.email },
        status: 'SUCCESS'
      });

      res.status(200).json({
        success: true,
        message: `User ${user.email} was successfully deleted.`
      });
    } catch (err: any) {
      logger.error(`Error in deleteUser: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to delete user.' });
    }
  }

  // 5. Add Another Admin
  async createAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const lowerEmail = email.toLowerCase().trim();

      const existing = await User.findOne({ email: lowerEmail });
      if (existing) {
        if (existing.role === 'admin') {
          res.status(409).json({ success: false, message: 'User is already an administrator.' });
          return;
        }
        existing.role = 'admin';
        await existing.save();

        await ActivityLog.create({
          userId: req.user?._id,
          userEmail: req.user?.email || 'admin',
          userName: req.user?.name || 'Administrator',
          userRole: 'admin',
          action: 'PROMOTED_TO_ADMIN',
          category: 'USER_MANAGEMENT',
          details: `Promoted existing user ${existing.email} to administrator`,
          status: 'SUCCESS'
        });

        res.status(200).json({
          success: true,
          message: `User ${existing.email} has been promoted to Administrator.`,
          data: { user: existing }
        });
        return;
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const newAdmin = await User.create({
        name,
        email: lowerEmail,
        passwordHash,
        role: 'admin',
        isBlocked: false,
        preferences: { theme: 'system', emailNotifications: true }
      });

      await ActivityLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || 'admin',
        userName: req.user?.name || 'Administrator',
        userRole: 'admin',
        action: 'CREATED_NEW_ADMIN',
        category: 'USER_MANAGEMENT',
        details: `Created new administrator account for ${newAdmin.email}`,
        status: 'SUCCESS'
      });

      res.status(201).json({
        success: true,
        message: `New Administrator ${newAdmin.email} created successfully.`,
        data: {
          user: {
            id: newAdmin._id,
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role
          }
        }
      });
    } catch (err: any) {
      logger.error(`Error in createAdmin: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to create administrator.' });
    }
  }

  // 6. Real-Time Activity Logs
  async getLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = Math.min(100, parseInt((req.query.limit as string) || '50', 10));
      const category = req.query.category as string;
      const search = req.query.search as string;

      const filter: any = {};
      if (category && category !== 'ALL') {
        filter.category = category;
      }
      if (search) {
        filter.$or = [
          { userEmail: { $regex: search, $options: 'i' } },
          { userName: { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } },
          { details: { $regex: search, $options: 'i' } }
        ];
      }

      const logs = await ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.status(200).json({
        success: true,
        data: { logs }
      });
    } catch (err: any) {
      logger.error(`Error in getLogs: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to retrieve logs.' });
    }
  }
}

export const adminController = new AdminController();
