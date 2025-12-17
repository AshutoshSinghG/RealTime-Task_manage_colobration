import mongoose, { Schema, Document, Types } from 'mongoose';

export enum TaskStatus {
    TODO = 'To Do',
    IN_PROGRESS = 'In Progress',
    REVIEW = 'Review',
    COMPLETED = 'Completed'
}

export enum TaskPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    URGENT = 'Urgent'
}

export interface ITask extends Document {
    title: string;
    description: string;
    dueDate: Date;
    priority: TaskPriority;
    status: TaskStatus;
    creatorId: Types.ObjectId;
    assignedToId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required']
        },
        priority: {
            type: String,
            enum: Object.values(TaskPriority),
            default: TaskPriority.MEDIUM
        },
        status: {
            type: String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.TODO
        },
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        assignedToId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

taskSchema.index({ creatorId: 1, status: 1 });
taskSchema.index({ assignedToId: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
