import type { Request, Response, NextFunction } from 'express'
import Task, { ITask } from '../models/Task'

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists( req: Request, res: Response, next: NextFunction ) {
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if(!task) {
            const error = new Error('Tarea no encontrada')
            return res.status(404).json({error: error.message})
        }
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export function taskBelongsToProject(req: Request, res: Response, next: NextFunction ) {
    if(req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(400).json({error: error.message}) 
    }
    next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction ) {
    if( req.user.id.toString() !== req.project.manager.toString() ) {
        const error = new Error('Acción no válida')
        return res.status(400).json({error: error.message}) 
    }
    next()
}

export function isProjectMemberOrManager(req: Request, res: Response, next: NextFunction ) {
    const userId = req.user.id.toString()
    const isManager = req.project.manager.toString() === userId
    const isTeamMember = req.project.team.some( member => member.toString() === userId )

    if( !isManager && !isTeamMember ) {
        const error = new Error('Acción no válida')
        return res.status(400).json({error: error.message})
    }
    next()
}

export function hasAuthorizationTaskEdit(req: Request, res: Response, next: NextFunction ) {
    const userId = req.user.id.toString()
    const isManager = req.project.manager.toString() === userId
    const isCreator = req.task.createdBy?.toString() === userId

    if( !isManager && !isCreator ) {
        const error = new Error('Solo el manager o quien creó la tarea puede realizar esta acción')
        return res.status(400).json({error: error.message})
    }
    next()
}
