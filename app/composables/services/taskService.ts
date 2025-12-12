import type { GPTask, GPProject } from '~/types/gameplan'
import { isToday, isYesterday, isInRange, getStartOfDay, getEndOfDay } from '../utils/dateUtils'
import { getAllTasks as apiGetAllTasks, getAllProjects as apiGetAllProjects } from './api'

export function getAllTasks(): Promise<GPTask[]> {
  return apiGetAllTasks()
}

export function getTasksByAssignee(tasks: GPTask[], email: string): GPTask[] {
  return tasks.filter(task => task.assigned_to === email)
}

export function getTasksByStatus(tasks: GPTask[], status: string): GPTask[] {
  return tasks.filter(task => task.status === status)
}

export function getTasksByProject(tasks: GPTask[], project: string): GPTask[] {
  return tasks.filter(task => task.project === project)
}

export function getTasksByTeam(tasks: GPTask[], team: string, projects: GPProject[]): GPTask[] {
  // Find projects belonging to the team
  const teamProjects = projects.filter(p => p.team === team).map(p => p.name)
  return tasks.filter(task => task.project && teamProjects.includes(task.project))
}

export async function getTasksByTeamAsync(tasks: GPTask[], team: string): Promise<GPTask[]> {
  const projects = await apiGetAllProjects()
  return getTasksByTeam(tasks, team, projects)
}

export function getBacklogTasks(tasks: GPTask[]): GPTask[] {
  const now = new Date()
  return tasks.filter(task => {
    if (!task.due_date) return false
    if (task.status === 'Completed' || task.status === 'Closed') return false

    const dueDate = new Date(task.due_date)
    return dueDate < now
  })
}

export function getTasksModifiedToday(tasks: GPTask[]): GPTask[] {
  return tasks.filter(task => {
    if (!task.modified) return false
    return isToday(new Date(task.modified))
  })
}

export function getTasksModifiedYesterday(tasks: GPTask[]): GPTask[] {
  return tasks.filter(task => {
    if (!task.modified) return false
    return isYesterday(new Date(task.modified))
  })
}

export function getTasksModifiedInRange(tasks: GPTask[], startDate: Date, endDate: Date): GPTask[] {
  return tasks.filter(task => {
    if (!task.modified) return false
    return isInRange(new Date(task.modified), startDate, endDate)
  })
}

export function getTasksNotModifiedInRange(tasks: GPTask[], startDate: Date, endDate: Date): GPTask[] {
  return tasks.filter(task => {
    if (!task.modified) return true // Tasks without modified date are considered not modified
    const modifiedDate = new Date(task.modified)
    return !isInRange(modifiedDate, startDate, endDate)
  })
}

export async function getAllProjects(): Promise<GPProject[]> {
  return apiGetAllProjects()
}

