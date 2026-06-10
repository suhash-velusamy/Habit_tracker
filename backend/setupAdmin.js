const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifesync_db');
  const db = mongoose.connection.db;

  // Set all existing users to 'user' role
  await db.collection('users').updateMany({}, { $set: { role: 'user' } });

  // Insert or update the admin user
  const hash = await bcrypt.hash('admin@123', 10);
  await db.collection('users').updateOne(
    { email: 'admin@gmail.com' },
    {
      $set: {
        full_name: 'System Admin',
        password: hash,
        role: 'admin',
        xp_points: 0,
        current_level: 1,
        status: 'Active'
      }
    },
    { upsert: true }
  );

  console.log('Admin user created and others set to user');
  await mongoose.disconnect();
}

run().catch(console.error);
