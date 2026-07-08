import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface INotificationEmail {
    email: string
    name: string
    projectName: string
    message: string
    projectId: string
}

export class NotificationEmail {

    static sendNotification = async (user: INotificationEmail) => {
        try {
            const info = await resend.emails.send({
                from: 'UpTask <no-reply@mail.estudiols.net.ar>',
                to: user.email,
                subject: `UpTask - Novedades en ${user.projectName}`,
                html: `
                    <p>Hola: ${user.name}</p>

                    <p>${user.message}</p>

                    <p>Visita el siguiente enlace para ver los detalles:</p>

                    <a href="${process.env.FRONTEND_URL}/projects/${user.projectId}">
                        Ver Proyecto
                    </a>
                `
            })

            if (info.error) {
                console.error(`❌ Error enviando notificación a ${user.email}:`)
                console.error(info.error)
                return
            }

            console.log(`✅ Notificación enviada a ${user.email}`)
            console.log(`ID: ${info.data?.id}`)

        } catch (error) {
            console.error('❌ Error inesperado al enviar la notificación:')
            console.error(error)
        }
    }
}