import type { QueryFilters, EmployeeQueryResult } from '~/types/query'
import type { GPTask, GPComment, GPProject, GPTeam } from '~/types/gameplan'
import { getTasksByTeam, getTasksModifiedToday, getTasksModifiedYesterday, getTasksNotModifiedInRange, getBacklogTasks, getAllProjects, getAllTasks } from './taskService'
import { getCommentsToday, getCommentsByUser, getAllComments } from './commentService'
import { getAllTeams } from './api'
import { groupByEmployee, applyFilters } from '../utils/queryUtils'
import { isToday } from '../utils/dateUtils'

export async function getEmployeesNotUpdatedToday(
  filters?: QueryFilters,
  tasks?: GPTask[],
  projects?: GPProject[]
): Promise<EmployeeQueryResult[]> {
  // Use provided tasks or fetch if not provided
  const allTasks = tasks || await getAllTasks()
  let filteredTasks = allTasks

  // Apply filters
  if (filters?.team) {
    const projects = await getAllProjects()
    filteredTasks = getTasksByTeam(filteredTasks, filters.team, projects)
  }

  if (filters?.project) {
    filteredTasks = filteredTasks.filter(t => t.project === filters.project)
  }

  // Get tasks modified today
  const tasksModifiedToday = getTasksModifiedToday(filteredTasks)

  // Group by employee
  const tasksByEmployee = groupByEmployee(filteredTasks)

  // Find employees with no tasks modified today
  const results: EmployeeQueryResult[] = []

  for (const [email, tasks] of Object.entries(tasksByEmployee)) {
    const employeeTasksModifiedToday = getTasksModifiedToday(tasks)
    if (employeeTasksModifiedToday.length === 0) {
      results.push({
        employee: { email },
        taskCount: tasks.length,
        lastUpdateDate: tasks[0]?.modified
      })
    }
  }

  return results
}

export async function getEmployeesNotUpdatedYesterday(
  filters?: QueryFilters,
  tasks?: GPTask[],
  projects?: GPProject[]
): Promise<EmployeeQueryResult[]> {
  const allTasks = tasks || await getAllTasks()
  let filteredTasks = allTasks

  // Apply filters
  if (filters?.team) {
    const teamProjects = projects || await getAllProjects()
    filteredTasks = getTasksByTeam(filteredTasks, filters.team, teamProjects)
  }

  if (filters?.project) {
    filteredTasks = filteredTasks.filter(t => t.project === filters.project)
  }

  // Get tasks modified yesterday
  const tasksModifiedYesterday = getTasksModifiedYesterday(filteredTasks)

  // Group by employee
  const tasksByEmployee = groupByEmployee(filteredTasks)

  // Find employees with no tasks modified yesterday
  const results: EmployeeQueryResult[] = []

  for (const [email, tasks] of Object.entries(tasksByEmployee)) {
    const employeeTasksModifiedYesterday = getTasksModifiedYesterday(tasks)
    if (employeeTasksModifiedYesterday.length === 0) {
      results.push({
        employee: { email },
        taskCount: tasks.length,
        lastUpdateDate: tasks[0]?.modified
      })
    }
  }

  return results
}

export async function getEmployeesNotCommentedToday(
  filters?: QueryFilters,
  tasks?: GPTask[],
  comments?: GPComment[],
  projects?: GPProject[]
): Promise<EmployeeQueryResult[]> {
  const allTasks = tasks || await getAllTasks()
  const allComments = comments || await getAllComments()

  let filteredTasks = allTasks

  // Apply filters
  if (filters?.team) {
    const teamProjects = projects || await getAllProjects()
    filteredTasks = getTasksByTeam(filteredTasks, filters.team, teamProjects)
  }

  if (filters?.project) {
    filteredTasks = filteredTasks.filter(t => t.project === filters.project)
  }

  // Get comments made today
  const commentsToday = getCommentsToday(allComments)
  const employeesWhoCommentedToday = new Set(commentsToday.map(c => c.owner).filter(Boolean))

  // Group tasks by employee
  const tasksByEmployee = groupByEmployee(filteredTasks)

  // Create a map of task name to set of employees who commented on it
  const commentsByTask = new Map<string, Set<string>>()
  allComments.forEach(comment => {
    if (comment.reference_name && comment.reference_doctype === 'GP Task' && comment.owner) {
      if (!commentsByTask.has(comment.reference_name)) {
        commentsByTask.set(comment.reference_name, new Set())
      }
      commentsByTask.get(comment.reference_name)!.add(comment.owner)
    }
  })

  // Find employees who haven't commented today and their tasks without comments
  const results: EmployeeQueryResult[] = []

  for (const [email, employeeTasks] of Object.entries(tasksByEmployee)) {
    if (!employeesWhoCommentedToday.has(email)) {
      const userComments = getCommentsByUser(allComments, email)
      const lastComment = userComments.sort((a, b) => {
        const dateA = a.creation ? new Date(a.creation).getTime() : 0
        const dateB = b.creation ? new Date(b.creation).getTime() : 0
        return dateB - dateA
      })[0]

      // Find tasks that don't have comments from this employee
      const tasksWithoutComments = employeeTasks.filter(task => {
        const taskComments = commentsByTask.get(task.name)
        return !taskComments || !taskComments.has(email)
      })

      results.push({
        employee: { email },
        taskCount: employeeTasks.length,
        lastCommentDate: lastComment?.creation,
        tasks: tasksWithoutComments
      })
    }
  }

  return results
}

export async function getEmployeesWithBacklog(
  filters?: QueryFilters,
  tasks?: GPTask[],
  projects?: GPProject[]
): Promise<EmployeeQueryResult[]> {
  const allTasks = tasks || await getAllTasks()
  let filteredTasks = allTasks

  // Apply filters
  if (filters?.team) {
    const teamProjects = projects || await getAllProjects()
    filteredTasks = getTasksByTeam(filteredTasks, filters.team, teamProjects)
  }

  if (filters?.project) {
    filteredTasks = filteredTasks.filter(t => t.project === filters.project)
  }

  // Get backlog tasks
  const backlogTasks = getBacklogTasks(filteredTasks)

  // Group by employee
  const backlogByEmployee = groupByEmployee(backlogTasks)

  // Create results sorted by backlog count
  const results: EmployeeQueryResult[] = Object.entries(backlogByEmployee)
    .map(([email, tasks]) => ({
      employee: { email },
      backlogCount: tasks.length,
      taskCount: filteredTasks.filter(t => t.assigned_to === email).length,
      tasks: tasks,
      metrics: {
        overdueTasks: tasks.length
      }
    }))
    .sort((a, b) => (b.backlogCount || 0) - (a.backlogCount || 0))

  return results
}

export async function getTaskCompletionRates(
  filters?: QueryFilters,
  tasks?: GPTask[],
  projects?: GPProject[]
): Promise<EmployeeQueryResult[]> {
  const allTasks = tasks || await getAllTasks()
  let filteredTasks = allTasks

  // Apply filters
  if (filters?.team) {
    const teamProjects = projects || await getAllProjects()
    filteredTasks = getTasksByTeam(filteredTasks, filters.team, teamProjects)
  }

  if (filters?.project) {
    filteredTasks = filteredTasks.filter(t => t.project === filters.project)
  }

  // Group by employee
  const tasksByEmployee = groupByEmployee(filteredTasks)

  // Calculate completion rates
  const results: EmployeeQueryResult[] = Object.entries(tasksByEmployee)
    .map(([email, tasks]) => {
      const completedTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'Closed')
      const totalTasks = tasks.length
      const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0

      return {
        employee: { email },
        taskCount: totalTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        metrics: {
          totalTasks,
          completedTasks: completedTasks.length,
          inProgressTasks: tasks.filter(t => t.status === 'In Progress' || t.status === 'Open').length
        }
      }
    })
    .sort((a, b) => (a.completionRate || 0) - (b.completionRate || 0))

  return results
}

export async function getTasksNotUpdatedByDateRange(
  startDate: Date,
  endDate: Date,
  filters?: QueryFilters,
  tasks?: GPTask[],
  projects?: GPProject[]
): Promise<EmployeeQueryResult[]> {
  const allTasks = tasks || await getAllTasks()
  let filteredTasks = allTasks

  // Apply filters
  if (filters?.team) {
    const teamProjects = projects || await getAllProjects()
    filteredTasks = getTasksByTeam(filteredTasks, filters.team, teamProjects)
  }

  if (filters?.project) {
    filteredTasks = filteredTasks.filter(t => t.project === filters.project)
  }

  // Get tasks not modified in date range
  const tasksNotUpdated = getTasksNotModifiedInRange(filteredTasks, startDate, endDate)

  // Group by employee
  const tasksByEmployee = groupByEmployee(tasksNotUpdated)

  // Create results
  const results: EmployeeQueryResult[] = Object.entries(tasksByEmployee)
    .map(([email, tasks]) => ({
      employee: { email },
      taskCount: tasks.length,
      tasks: tasks,
      lastUpdateDate: tasks[0]?.modified
    }))

  return results
}

export async function getEmployeeTasks(
  filters?: QueryFilters,
  tasks?: GPTask[],
  projects?: GPProject[]
): Promise<EmployeeQueryResult[]> {
  const allTasks = tasks || await getAllTasks()
  let filteredTasks = allTasks

  // Apply filters
  if (filters?.team) {
    const teamProjects = projects || await getAllProjects()
    filteredTasks = getTasksByTeam(filteredTasks, filters.team, teamProjects)
  }

  if (filters?.project) {
    filteredTasks = filteredTasks.filter(t => t.project === filters.project)
  }

  // Filter out completed/closed/done tasks
  const activeTasks = filteredTasks.filter(
    task => {
      const status = task.status?.toLowerCase() || ''
      return status !== 'completed' && status !== 'closed' && status !== 'done'
    }
  )

  // Group by employee
  const tasksByEmployee = groupByEmployee(activeTasks)

  // Create results sorted by task count
  const results: EmployeeQueryResult[] = Object.entries(tasksByEmployee)
    .map(([email, tasks]) => ({
      employee: { email },
      taskCount: tasks.length,
      tasks: tasks,
      metrics: {
        totalTasks: tasks.length,
        inProgressTasks: tasks.filter(t => t.status === 'In Progress' || t.status === 'Open').length
      }
    }))
    .sort((a, b) => (b.taskCount || 0) - (a.taskCount || 0))

  return results
}

