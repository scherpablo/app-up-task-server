import type { Request, Response } from 'express'
import Task from '../models/Task'
import { notifyProject } from '../utils/notify'

export class TaskController {
    /*static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body)
            task.project = req.project.id
            task.createdBy = req.user.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([task.save(), req.project.save()])
            res.send('Tarea creada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }*/
    static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body)
            task.project = req.project.id
            task.createdBy = req.user.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([task.save(), req.project.save()])

            notifyProject({
                projectId: req.project.id,
                taskId: task.id,
                type: 'taskCreated',
                message: `${req.user.name} creó la tarea "${task.name}"`,
                createdBy: req.user.id
            })

            res.send('Tarea creada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({ project: req.project.id }).populate('project')
            res.json(tasks)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id)
                .populate({ path: 'completedBy.user', select: 'id name email' })
                .populate({ path: 'notes', populate: { path: 'createdBy', select: 'id name email' } })
                .populate({ path: 'createdBy', select: 'id name email' })
            res.json(task)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()
            res.send("Tarea Actualizada Correctamente")
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    /*static deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString())
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])
            res.send("Tarea Eliminada Correctamente")
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }*/
    static deleteTask = async (req: Request, res: Response) => {
        try {
            const taskName = req.task.name
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString())
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])

            notifyProject({
                projectId: req.project.id,
                type: 'taskDeleted',
                message: `${req.user.name} eliminó la tarea "${taskName}"`,
                createdBy: req.user.id
            })

            res.send("Tarea Eliminada Correctamente")
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    /*static updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status
            const data = {
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data)
            await req.task.save()
            res.send('Tarea Actualizada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }*/

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            const previousStatus = req.task.status
            req.task.status = status
            const data = {
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data)
            await req.task.save()

            notifyProject({
                projectId: req.project.id,
                taskId: req.task.id,
                type: 'taskStatusChanged',
                message: `${req.user.name} cambió el estado de la tarea "${req.task.name}" de "${previousStatus}" a "${status}"`,
                createdBy: req.user.id
            })

            res.send('Tarea Actualizada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}