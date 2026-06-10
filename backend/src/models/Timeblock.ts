import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeblock extends Document {
  user_id: mongoose.Types.ObjectId;
  block_id: string;
  hour: string;
  task: string;
  completed: boolean;
}

const TimeblockSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  block_id: { type: String, required: true },
  hour: { type: String, required: true },
  task: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

// Ensure a user only has one specific block_id entry
TimeblockSchema.index({ user_id: 1, block_id: 1 }, { unique: true });

export default mongoose.model<ITimeblock>('Timeblock', TimeblockSchema);
