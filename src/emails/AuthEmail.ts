import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {

    static sendConfirmationEmail = async (user: IEmail) => {
        try {
            const info = await resend.emails.send({
                from: 'UpTask <no-reply@mail.estudiols.net.ar>',
                to: user.email,
                subject: 'UpTask - Confirma tu cuenta',
                html: `
                    <p>Hola: ${user.name}, has creado tu cuenta en UpTask, ya casi está todo listo, solo debes confirmar tu cuenta.</p>

                    <p>Visita el siguiente enlace:</p>

                    <a href="${process.env.FRONTEND_URL}/auth/confirm-account">
                        Confirmar cuenta
                    </a>

                    <p>E ingresa el código: <b>${user.token}</b></p>

                    <p>Este token expira en 10 minutos.</p>
                `
            })

            if (info.error) {
                console.error(`❌ Error enviando email de confirmación a ${user.email}:`)
                console.error(info.error)
                return
            }

            console.log(`✅ Email de confirmación enviado a ${user.email}`)
            console.log(`ID: ${info.data?.id}`)

        } catch (error) {
            console.error('❌ Error inesperado al enviar el email de confirmación:')
            console.error(error)
        }
    }

    static sendPasswordResetToken = async (user: IEmail) => {
        try {
            const info = await resend.emails.send({
                from: 'UpTask <no-reply@mail.estudiols.net.ar>',
                to: user.email,
                subject: 'UpTask - Reestablece tu password',
                html: `
                    <p>Hola: ${user.name}, has solicitado reestablecer tu password.</p>

                    <p>Visita el siguiente enlace:</p>

                    <a href="${process.env.FRONTEND_URL}/auth/new-password">
                        Reestablecer Password
                    </a>

                    <p>E ingresa el código: <b>${user.token}</b></p>

                    <p>Este token expira en 10 minutos.</p>
                `
            })

            if (info.error) {
                console.error(`❌ Error enviando email de recuperación a ${user.email}:`)
                console.error(info.error)
                return
            }

            console.log(`✅ Email de recuperación enviado a ${user.email}`)
            console.log(`ID: ${info.data?.id}`)

        } catch (error) {
            console.error('❌ Error inesperado al enviar el email de recuperación:')
            console.error(error)
        }
    }
}