import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
    userId: Types.ObjectId;
    message: string;
    taskId?: Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true
        },
        taskId: {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
