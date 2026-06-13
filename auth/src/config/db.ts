import mongoose from 'mongoose';
import { env } from './env';

export async function connectMongoDB(): Promise<void> {
  try {
    const connection = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}