import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { Feedback } from '../models/Feedback';

export const feedbackSchema = z.object({
  body: z.object({
    analysisId: z.string().min(1, 'analysisId is required'),
    claimId: z.string().optional(),
    feedbackType: z.enum([
      'incorrect_extraction',
      'irrelevant_source',
      'missing_contradiction',
      'wrong_assessment',
      'broken_link',
      'other'
    ]),
    description: z.string().min(5, 'Description must be at least 5 characters').max(2000)
  })
});

export class FeedbackController {
  async submitFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { analysisId, claimId, feedbackType, description } = req.body;
    const userId = req.user ? req.user._id : undefined;

    const feedback = await Feedback.create({
      userId,
      analysisId,
      claimId,
      feedbackType,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for helping improve TruthLens AI verification accuracy.',
      data: { feedbackId: feedback._id }
    });
  }
}

export const feedbackController = new FeedbackController();
