import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedReport {
  analysisId: mongoose.Types.ObjectId;
  notes?: string;
  savedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
  };
  savedReports: ISavedReport[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      emailNotifications: { type: Boolean, default: false }
    },
    savedReports: [
      {
        analysisId: { type: Schema.Types.ObjectId, ref: 'Analysis', required: true },
        notes: { type: String, maxlength: 1000 },
        savedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Never expose passwordHash in toJSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);
