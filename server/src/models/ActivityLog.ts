import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'AUTH' | 'ANALYSIS' | 'USER_MANAGEMENT' | 'SYSTEM' | 'FEEDBACK';
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userEmail: { type: String, required: true, index: true },
    userName: { type: String, default: 'Anonymous' },
    userRole: { type: String, default: 'user' },
    action: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['AUTH', 'ANALYSIS', 'USER_MANAGEMENT', 'SYSTEM', 'FEEDBACK'],
      default: 'SYSTEM',
      index: true
    },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    status: { type: String, enum: ['SUCCESS', 'WARNING', 'FAILED'], default: 'SUCCESS' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
