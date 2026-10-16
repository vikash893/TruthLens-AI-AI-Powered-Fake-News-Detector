import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Claim } from '../models/Claim';
import { Evidence } from '../models/Evidence';

export class ClaimController {
  async getClaimById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid claim ID.' });
      return;
    }

    const claim = await Claim.findById(id);
    if (!claim) {
      res.status(404).json({ success: false, message: 'Claim not found.' });
      return;
    }

    const evidence = await Evidence.find({ claimId: id }).sort({ finalRankScore: -1 });

    res.status(200).json({
      success: true,
      data: {
        claim,
        evidence
      }
    });
  }

  async getClaimEvidence(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid claim ID.' });
      return;
    }

    const evidence = await Evidence.find({ claimId: id }).sort({ finalRankScore: -1 });
    const supporting = evidence.filter((e) => e.evidenceRelationship === 'SUPPORTS');
    const contradicting = evidence.filter((e) => e.evidenceRelationship === 'REFUTES');
    const neutral = evidence.filter((e) => ['CONTEXT', 'MENTION'].includes(e.evidenceRelationship));

    res.status(200).json({
      success: true,
      data: {
        total: evidence.length,
        supporting,
        contradicting,
        neutral
      }
    });
  }
}

export const claimController = new ClaimController();
