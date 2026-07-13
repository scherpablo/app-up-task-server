import type { Request, Response } from 'express'
import Notification from '../models/Notification'
import Project from '../models/Project'

export class NotificationController {

    static getUnreadCounts = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user.id } },
                    { team: { $in: req.user.id } }
                ]
            }).select('_id')

            const projectIds = projects.map(p => p._id)

            const notifications = await Notification.find({
                project: { $in: projectIds },
                readBy: { $ne: req.user.id }
            }).select('project')

            const counts: Record<string, number> = {}
            for (const projectId of projectIds) {
                counts[projectId.toString()] = 0
            }
            for (const notification of notifications) {
                const key = notification.project.toString()
                counts[key] = (counts[key] || 0) + 1
            }

            res.json(counts)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getProjectNotifications = async (req: Request, res: Response) => {
        try {
            const notifications = await Notification.find({ project: req.project.id })
                .sort({ createdAt: -1 })
                .limit(50)

            const result = notifications.map(notification => ({
                _id: notification._id,
                type: notification.type,
                message: notification.message,
                task: notification.task,
                createdAt: notification.createdAt,
                isRead: notification.readBy.some(userId => userId.toString() === req.user.id.toString())
            }))

            res.json(result)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static markAsRead = async (req: Request, res: Response) => {
        try {
            const { notificationId } = req.params
            const notification = await Notification.findById(notificationId)

            if (!notification) {
                const error = new Error('Notificación no encontrada')
                return res.status(404).json({ error: error.message })
            }

            const alreadyRead = notification.readBy.some(userId => userId.toString() === req.user.id.toString())
            if (!alreadyRead) {
                notification.readBy.push(req.user.id)
                await notification.save()
            }

            res.send('Notificación marcada como leída')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}