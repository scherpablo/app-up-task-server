import { Types } from 'mongoose'
import Project from '../models/Project'
import Notification, { NotificationType } from '../models/Notification'
import { NotificationEmail } from '../emails/NotificationEmail'

type NotifyParams = {
    projectId: Types.ObjectId | string
    taskId?: Types.ObjectId | string
    type: NotificationType
    message: string
    createdBy: Types.ObjectId | string
}

export async function notifyProject({ projectId, taskId, type, message, createdBy }: NotifyParams) {
    try {
        const project = await Project.findById(projectId)
            .populate('manager', 'id name email')
            .populate('team', 'id name email')

        if (!project) return

        // Guardar la notificación en la base de datos
        const notification = new Notification()
        notification.project = project.id
        if (taskId) notification.task = taskId as any
        notification.type = type
        notification.message = message
        notification.createdBy = createdBy as any
        await notification.save()

        // Armar lista de destinatarios: manager + equipo, sin duplicados, sin notificar a quien generó la acción
        const allMembers = [project.manager, ...project.team] as any[]

        const recipients = allMembers.filter((user, index, self) =>
            user &&
            user.id.toString() !== createdBy.toString() &&
            self.findIndex(u => u.id.toString() === user.id.toString()) === index
        )

        // Enviar el mail a cada destinatario
        for (const user of recipients) {
            await NotificationEmail.sendNotification({
                email: user.email,
                name: user.name,
                projectName: project.projectName,
                message,
                projectId: project.id
            })
        }
    } catch (error) {
        console.error('❌ Error al generar notificación:', error)
    }
}