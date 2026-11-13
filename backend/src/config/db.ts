import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Support loading .env whether running from project root or backend folder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const DEFAULT_ATLAS_URI = 'mongodb+srv://suhashv23cse_db_user:yl8RcckpD7veSMwa@cluster0.5suk62y.mongodb.net/lifesync_db?retryWrites=true&w=majority';

let mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;

// Ensure database name is included if raw cluster URL was provided
if (mongoURI.includes('.mongodb.net') && !mongoURI.includes('.mongodb.net/')) {
  mongoURI = `${mongoURI}/lifesync_db?retryWrites=true&w=majority`;
}

export const initializeDatabase = async () => {
  console.log('Initializing MongoDB Atlas Database connection...');
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB Atlas connected successfully.');
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas server. Please check your network and Atlas credentials.');
    console.error('Error details:', err);
    throw err;
  }
};
