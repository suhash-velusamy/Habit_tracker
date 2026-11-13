import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './db';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const reset = async () => {
  console.log('Resetting MongoDB database...');
  try {
    await initializeDatabase();
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log('MongoDB database dropped/reset successfully.');
    } else {
      console.warn('MongoDB database connection not active. Skipping drop.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error resetting MongoDB database:', err);
    process.exit(1);
  }
};

reset();
