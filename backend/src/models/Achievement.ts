import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  user_id: mongoose.Types.ObjectId;
  badge_name: string;
  xp_earned: number;
  achieved_date: Date;
}

const AchievementSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badge_name: { type: String, required: true },
  xp_earned: { type: Number, default: 100 },
  achieved_date: { type: Date, default: Date.now }
});

// Ensure a user can only earn each badge once
AchievementSchema.index({ user_id: 1, badge_name: 1 }, { unique: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
