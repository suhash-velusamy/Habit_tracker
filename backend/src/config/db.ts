import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Support loading .env for local development
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const WORKING_ATLAS_URI = 'mongodb+srv://suhashv23cse_db_user:yl8RcckpD7veSMwa@cluster0.5suk62y.mongodb.net/lifesync_db?retryWrites=true&w=majority';

let mongoURI = process.env.MONGODB_URI || WORKING_ATLAS_URI;

// If an outdated/offline cluster (e.g. habittracker.qhy5smx.mongodb.net) is in the environment, fallback to working cluster
if (mongoURI.includes('habittracker.qhy5smx.mongodb.net') || !mongoURI.trim()) {
  console.warn('Redirecting from legacy cluster to active Atlas cluster (cluster0.5suk62y.mongodb.net)...');
  mongoURI = WORKING_ATLAS_URI;
}

// Ensure database name is present
if (mongoURI.includes('.mongodb.net') && !mongoURI.includes('.mongodb.net/')) {
  mongoURI = `${mongoURI}/lifesync_db?retryWrites=true&w=majority`;
}

export const initializeDatabase = async () => {
  const maskedURI = mongoURI.replace(/:([^:@]+)@/, ':****@');
  console.log(`Connecting to MongoDB Atlas Database: ${maskedURI}...`);
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB Atlas connected successfully.');
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas server. Please check your network and Atlas credentials.');
    console.error('Error details:', err);
    throw err;
  }
};
