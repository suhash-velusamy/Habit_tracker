import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone {
  id: string;
  name: string;
  completed: boolean;
}

export interface IGoal extends Document {
  user_id: mongoose.Types.ObjectId;
  goal_title: string;
  description?: string;
  category: string;
  type: 'Short-Term' | 'Long-Term';
  deadline: Date;
  progress_percentage: number;
  status: 'active' | 'completed';
  milestones: IMilestone[];
  created_date: Date;
}

const MilestoneSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const GoalSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  goal_title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Placement' },
  type: { type: String, enum: ['Short-Term', 'Long-Term'], default: 'Short-Term' },
  deadline: { type: Date, required: true },
  progress_percentage: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  milestones: { type: [MilestoneSchema], default: [] },
  created_date: { type: Date, default: Date.now }
});

export default mongoose.model<IGoal>('Goal', GoalSchema);
