const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifesync_db';

const truncateCollections = async () => {
  console.log('Truncating all MongoDB database collections...');
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
      console.log(`Collection '${key}' cleared successfully.`);
    }

    console.log('\nAll database collections cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error emptying database collections:', err);
    process.exit(1);
  }
};

truncateCollections();
