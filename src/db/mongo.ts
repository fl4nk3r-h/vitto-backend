import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vitto';

  await mongoose.connect(uri);
  console.log('[mongodb] Connected successfully');
}
