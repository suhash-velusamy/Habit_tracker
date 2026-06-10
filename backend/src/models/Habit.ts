import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  description?: string;
  target: string;
  frequency: string;
  reminder_time?: string;
  xp_reward: number;
  type: 'boolean' | 'counter';
  target_value: number;
  unit: string;
  streak: number;
  longest_streak: number;
  created_date: Date;
}

const HabitSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  target: { type: String, default: 'Complete' },
  frequency: { type: String, default: 'Daily' },
  reminder_time: { type: String, default: null },
  xp_reward: { type: Number, default: 10 },
  type: { type: String, enum: ['boolean', 'counter'], default: 'boolean' },
  target_value: { type: Number, default: 1 },
  unit: { type: String, default: '' },
  streak: { type: Number, default: 0 },
  longest_streak: { type: Number, default: 0 },
  created_date: { type: Date, default: Date.now }
});

// Ensure a user can only have one habit with the same name
HabitSchema.index({ user_id: 1, name: 1 }, { unique: true });

export default mongoose.model<IHabit>('Habit', HabitSchema);
