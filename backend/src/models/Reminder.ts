import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  user_id: mongoose.Types.ObjectId;
  reminder_id: string;
  time: string;
  title: string;
  category: string;
  active: boolean;
}

const ReminderSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reminder_id: { type: String, required: true },
  time: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  active: { type: Boolean, default: true }
});

// Ensure a user only has one unique reminder_id configuration
ReminderSchema.index({ user_id: 1, reminder_id: 1 }, { unique: true });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
