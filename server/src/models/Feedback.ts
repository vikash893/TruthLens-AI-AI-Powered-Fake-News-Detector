import mongoose, { Schema, Document } from 'mongoose';

export type FeedbackType =
  | 'incorrect_extraction'
  | 'irrelevant_source'
  | 'missing_contradiction'
  | 'wrong_assessment'
  | 'broken_link'
  | 'other';

export interface IFeedback extends Document {
  userId?: mongoose.Types.ObjectId;
  analysisId: mongoose.Types.ObjectId;
  claimId?: mongoose.Types.ObjectId;
  feedbackType: FeedbackType;
  description: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    analysisId: { type: Schema.Types.ObjectId, ref: 'Analysis', required: true, index: true },
    claimId: { type: Schema.Types.ObjectId, ref: 'Claim' },
    feedbackType: {
      type: String,
      enum: [
        'incorrect_extraction',
        'irrelevant_source',
        'missing_contradiction',
        'wrong_assessment',
        'broken_link',
        'other'
      ],
      required: true
    },
    description: { type: String, required: true, maxlength: 2000 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
