import mongoose, { Document, Schema } from 'mongoose';

export interface IOTPSession extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const OTPSessionSchema = new Schema<IOTPSession>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // TTL index: MongoDB auto-deletes documents 10 minutes after createdAt
    expires: 600,
  },
});

// Ensure only one active OTP per email at a time
OTPSessionSchema.index({ email: 1 }, { unique: true });

export const OTPSession = mongoose.model<IOTPSession>('OTPSession', OTPSessionSchema);
