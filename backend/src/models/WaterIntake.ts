import mongoose, { Schema, Document } from 'mongoose';

export interface IWaterIntake extends Document {
  user_id: mongoose.Types.ObjectId;
  litres_consumed: number;
  date: string; // YYYY-MM-DD string representation
}

const WaterIntakeSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  litres_consumed: { type: Number, default: 0.00 },
  date: { type: String, required: true }
});

// Ensure a user can only have one water intake entry per day
WaterIntakeSchema.index({ user_id: 1, date: 1 }, { unique: true });

export default mongoose.model<IWaterIntake>('WaterIntake', WaterIntakeSchema);
