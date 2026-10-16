import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Analysis } from '../models/Analysis';
import { Claim } from '../models/Claim';

export class UserController {
  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user ? req.user._id : null;
    const query = userId ? { userId } : {};

    const totalAnalyses = await Analysis.countDocuments(query);
    const recentAnalyses = await Analysis.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('inputType metadata overallSummary status totalClaimsCount supportedClaimsCount refutedClaimsCount mixedClaimsCount createdAt');

    // Aggregate assessment distribution from user's analyses
    const userAnalyses = await Analysis.find(query).select('_id');
    const analysisIds = userAnalyses.map((a) => a._id);

    const statusCounts = await Claim.aggregate([
      { $match: { analysisId: { $in: analysisIds } } },
      { $group: { _id: '$assessmentStatus', count: { $sum: 1 } } }
    ]);

    const distribution: Record<string, number> = {
      SUPPORTED: 0,
      REFUTED: 0,
      MIXED: 0,
      INSUFFICIENT_EVIDENCE: 0,
      OUT_OF_CONTEXT: 0,
      NOT_VERIFIABLE: 0
    };
    let totalClaimsChecked = 0;

    for (const sc of statusCounts) {
      if (distribution[sc._id] !== undefined) {
        distribution[sc._id] = sc.count;
      }
      totalClaimsChecked += sc.count;
    }

    // Frequently analyzed topics
    const topicBreakdown = await Claim.aggregate([
      { $match: { analysisId: { $in: analysisIds } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAnalyses,
        totalClaimsChecked,
        distribution,
        topicBreakdown: topicBreakdown.map((t) => ({ topic: t._id, count: t.count })),
        recentAnalyses
      }
    });
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const user = await User.findById(req.user._id).populate({
      path: 'savedReports.analysisId',
      select: 'inputType overallSummary status totalClaimsCount createdAt metadata'
    });

    res.status(200).json({
      success: true,
      data: { user }
    });
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { name, preferences } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (preferences) updateData.preferences = preferences;

    const updated = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-passwordHash');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updated }
    });
  }

  async toggleBookmark(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Must be logged in to bookmark reports.' });
      return;
    }

    const { id } = req.params;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid analysis ID.' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const existingIndex = user.savedReports.findIndex(
      (sr) => sr.analysisId.toString() === id
    );

    let isBookmarked = false;
    if (existingIndex > -1) {
      // Remove bookmark
      user.savedReports.splice(existingIndex, 1);
      isBookmarked = false;
    } else {
      // Add bookmark
      user.savedReports.push({
        analysisId: new mongoose.Types.ObjectId(id),
        notes: notes || '',
        savedAt: new Date()
      });
      isBookmarked = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Report saved to bookmarks.' : 'Report removed from bookmarks.',
      data: { isBookmarked, savedReports: user.savedReports }
    });
  }
}

export const userController = new UserController();
