import mongoose, { Schema, Document } from 'mongoose';

export interface IJournal extends Document {
  user_id: mongoose.Types.ObjectId;
  content: string;
  mood: 'Happy' | 'Motivated' | 'Neutral' | 'Sad' | 'Stressed';
  gratitude: string[];
  notes?: string;
  created_date: string; // YYYY-MM-DD string format
}

const JournalSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mood: { type: String, enum: ['Happy', 'Motivated', 'Neutral', 'Sad', 'Stressed'], required: true },
  gratitude: { type: [String], default: [] },
  notes: { type: String, default: '' },
  created_date: { type: String, required: true }
});

// Ensure a user can only have one journal entry per day
JournalSchema.index({ user_id: 1, created_date: 1 }, { unique: true });

export default mongoose.model<IJournal>('Journal', JournalSchema);
