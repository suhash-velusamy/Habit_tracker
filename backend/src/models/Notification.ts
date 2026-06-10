import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user_id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  read_status: boolean;
  created_date: Date;
}

const NotificationSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'reminder' },
  read_status: { type: Boolean, default: false },
  created_date: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
