import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifesync_db';

export const initializeDatabase = async () => {
  console.log('Initializing MongoDB Database connection...');
  try {
    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected successfully to ${mongoURI}`);
  } catch (err) {
    console.error('Failed to connect to MongoDB server. Please make sure MongoDB is running and URI is correct.');
    console.error('Error details:', err);
    throw err;
  }
};
