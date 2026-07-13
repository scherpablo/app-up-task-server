import mongoose, { Schema, Document, Types } from 'mongoose'

const notificationType = {
    TASK_CREATED: 'taskCreated',
    TASK_STATUS_CHANGED: 'taskStatusChanged',
    TASK_DELETED: 'taskDeleted',
    NOTE_CREATED: 'noteCreated',
    NOTE_DELETED: 'noteDeleted'
} as const

export type NotificationType = typeof notificationType[keyof typeof notificationType]

export interface INotification extends Document {
    project: Types.ObjectId
    task: Types.ObjectId
    type: NotificationType
    message: string
    createdBy: Types.ObjectId
    readBy: Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
}

const NotificationSchema: Schema = new Schema({
    project: {
        type: Types.ObjectId,
        ref: 'Project',
        required: true
    },
    task: {
        type: Types.ObjectId,
        ref: 'Task'
    },
    type: {
        type: String,
        enum: Object.values(notificationType),
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    readBy: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ]
}, {timestamps: true})

const Notification = mongoose.model<INotification>('Notification', NotificationSchema)
export default Notification