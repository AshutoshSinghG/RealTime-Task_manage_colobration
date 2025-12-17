import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
    taskId: Types.ObjectId;
    userId: Types.ObjectId;
    action: string;
    previousValue?: string;
    newValue?: string;
    timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
    {
        taskId: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            required: true,
            trim: true
        },
        previousValue: {
            type: String,
            trim: true
        },
        newValue: {
            type: String,
            trim: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: false
    }
);

auditLogSchema.index({ taskId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
