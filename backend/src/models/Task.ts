import mongoose, { Schema, Document } from 'mongoose';

export interface ISubTask {
  id: string;
  name: string;
  completed: boolean;
}

export interface ITask extends Document {
  user_id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  due_date: Date;
  status: 'todo' | 'in_progress' | 'done';
  category: string;
  subtasks: ISubTask[];
  recurrence: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  created_date: Date;
}

const SubTaskSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const TaskSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  due_date: { type: Date, default: Date.now },
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  category: { type: String, default: 'General' },
  subtasks: { type: [SubTaskSchema], default: [] },
  recurrence: { type: String, enum: ['None', 'Daily', 'Weekly', 'Monthly'], default: 'None' },
  created_date: { type: Date, default: Date.now }
});

export default mongoose.model<ITask>('Task', TaskSchema);
