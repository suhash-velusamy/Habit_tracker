import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  full_name: string;
  email: string;
  password?: string;
  profile_image: string;
  xp_points: number;
  current_level: number;
  created_date: Date;
  last_login?: Date;
  role: 'user' | 'admin';
  status: 'Active' | 'Suspended';
  bio: string;
  streak: number;
  longest_streak: number;
  streak_last_updated: string;
}

const UserSchema: Schema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_image: { type: String, default: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LifeSync' },
  xp_points: { type: Number, default: 0 },
  current_level: { type: Number, default: 1 },
  created_date: { type: Date, default: Date.now },
  last_login: { type: Date, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
  bio: { type: String, default: 'Preparing for placements and building skills!' },
  streak: { type: Number, default: 0 },
  longest_streak: { type: Number, default: 0 },
  streak_last_updated: { type: String, default: '' }
});

export default mongoose.model<IUser>('User', UserSchema);
