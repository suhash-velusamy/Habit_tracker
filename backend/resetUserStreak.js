const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifesync_db');
  
  // Force-set streak fields on all users
  const result = await mongoose.connection.db.collection('users').updateMany(
    {},
    { $set: { streak: 0, longest_streak: 0, streak_last_updated: '' } }
  );
  console.log('Users streak reset:', result.modifiedCount, 'modified,', result.matchedCount, 'matched');

  // Also reset all habit streak fields
  const habitResult = await mongoose.connection.db.collection('habits').updateMany(
    {},
    { $set: { streak: 0, longest_streak: 0 } }
  );
  console.log('Habits streak reset:', habitResult.modifiedCount, 'modified');

  await mongoose.disconnect();
}

run().catch(console.error);
