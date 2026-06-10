import cron from 'node-cron';
import User from '../models/User';
import Notification from '../models/Notification';
import { sendNotificationEmail } from './emailService';

// Helper to log and insert notifications in MongoDB for all active users
const pushReminderToActiveUsers = async (title: string, message: string, category: string) => {
  try {
    // 1. Fetch all active users
    const users = await User.find({ status: 'Active' });
    
    if (users.length === 0) return;

    console.log(`[Cron Reminder] Generating "${title}" for ${users.length} active users...`);

    // 2. Insert notification record for each user and dispatch mock email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const user of users) {
      // Check if notification already exists for this user, title, and last hour (to prevent duplicate cron triggers)
      const existing = await Notification.findOne({
        user_id: user._id,
        title,
        created_date: { $gte: oneHourAgo }
      });

      if (!existing) {
        await Notification.create({
          user_id: user._id,
          title,
          message,
          type: 'reminder'
        });

        // Also trigger simulated email notifications
        await sendNotificationEmail(
          user.email,
          `LifeSync Reminder: ${title}`,
          `Hi ${user.full_name},\n\nThis is your friendly reminder: ${message}\n\nStay consistent and reach your goals!\n- The LifeSync Team`
        );
      }
    }
  } catch (err) {
    console.error('Error in cron reminder job execution:', err);
  }
};

// Initialize Scheduled Cron Jobs
export const startCronJobs = () => {
  console.log('Registering Smart Reminder Cron Jobs...');

  // 1. 6:00 AM → Wake Up
  cron.schedule('0 6 * * *', () => {
    pushReminderToActiveUsers(
      'Wake Up Routine',
      'Rise and shine! Start your day with hydration, stretch, and check today\'s preparation goals.',
      'Daily Routine'
    );
  });

  // 2. 8:00 AM → Breakfast
  cron.schedule('0 8 * * *', () => {
    pushReminderToActiveUsers(
      'Breakfast Time 🍳',
      'Time to fuel your body! Grab a healthy breakfast and review today\'s study preparation plan.',
      'Health'
    );
  });

  // 3. 12:30 PM → Lunch
  cron.schedule('30 12 * * *', () => {
    pushReminderToActiveUsers(
      'Lunch Break 🍱',
      'It is lunchtime! Pause your coding tasks and take a healthy break.',
      'Health'
    );
  });

  // 4. 7:30 PM → Dinner
  cron.schedule('30 19 * * *', () => {
    pushReminderToActiveUsers(
      'Dinner Time 🍽',
      'Time to wrap up your study schedules and have a relaxed dinner.',
      'Health'
    );
  });

  // 5. 6:00 PM → LeetCode Practice
  cron.schedule('0 18 * * *', () => {
    pushReminderToActiveUsers(
      'LeetCode Problem Practice ⚔',
      'Time for your daily algorithms review! Solve at least one coding problem on LeetCode.',
      'Coding'
    );
  });

  // 6. 9:00 PM → Daily Review
  cron.schedule('0 21 * * *', () => {
    pushReminderToActiveUsers(
      'Daily Reflection Journal 📝',
      'It is 9:00 PM. Reflect on your daily progress, log your journals, and plan tomorrow\'s sessions.',
      'Daily Review'
    );
  });

  // 7. Every 2 Hours → Water Intake
  // Run on the hour, every 2 hours (e.g. 8:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00)
  cron.schedule('0 */2 * * *', () => {
    const hour = new Date().getHours();
    if (hour >= 8 && hour <= 22) {
      pushReminderToActiveUsers(
        'Hydration Reminder 💧',
        'Drink water! Keep your hydration level steady (Target: 3 Litres per day). Take a quick 250ml glass now.',
        'Health'
      );
    }
  });

  console.log('Cron Jobs configured successfully.');
};
