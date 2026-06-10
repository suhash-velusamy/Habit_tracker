import mongoose, { Schema, Document } from 'mongoose';

export interface IHabitCompletion extends Document {
  user_id: mongoose.Types.ObjectId;
  habit_id: mongoose.Types.ObjectId;
  completion_status: 'completed' | 'partial';
  value: number;
  completion_date: string; // YYYY-MM-DD string representation
  xp_earned: number;
}

const HabitCompletionSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  habit_id: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  completion_status: { type: String, enum: ['completed', 'partial'], default: 'completed' },
  value: { type: Number, default: 0.00 },
  completion_date: { type: String, required: true },
  xp_earned: { type: Number, default: 0 }
});

// Ensure a user can only have one log per habit per day
HabitCompletionSchema.index({ user_id: 1, habit_id: 1, completion_date: 1 }, { unique: true });

export default mongoose.model<IHabitCompletion>('HabitCompletion', HabitCompletionSchema);
