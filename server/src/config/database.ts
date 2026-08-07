import mongoose from 'mongoose';
import { ENV } from './env.js';
import { seedDemoAccounts } from '../utils/seed.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    await seedDemoAccounts();
  } catch (error) {
    console.error(`[Database] Connection Error:`, error);
    // In production/docker we handle gracefully or retry
  }
};
