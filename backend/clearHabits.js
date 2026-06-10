const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifesync_db';

const clearHabits = async () => {
  console.log('Clearing all habits and habit completion logs for all users in MongoDB...');
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    // Mongoose standard pluralization creates collections named 'habits' and 'habitcompletions'
    const collections = mongoose.connection.collections;
    
    if (collections['habits']) {
      await collections['habits'].deleteMany({});
      console.log("Cleared 'habits' collection.");
    }
    if (collections['habitcompletions']) {
      await collections['habitcompletions'].deleteMany({});
      console.log("Cleared 'habitcompletions' collection.");
    }

    console.log('\nAll user habits cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing database habit collections:', err);
    process.exit(1);
  }
};

clearHabits();
