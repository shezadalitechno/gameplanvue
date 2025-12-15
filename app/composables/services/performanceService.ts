import type { GPTask, GPComment, GPActivity, GPTeam } from '~/types/gameplan'
import type { PerformanceMetrics, RiskIndicator, TeamMetrics, TrendData } from '~/types/performance'
import { getBacklogTasks, getTasksByAssignee } from './taskService'
import { getCommentsByUser } from './commentService'
import { getActivitiesByUser, getActivitiesToday } from './activityService'
import { groupByEmployee } from '../utils/queryUtils'
import { getDaysAgo } from '../utils/dateUtils'

export function calculatePerformanceMetrics(
  tasks: GPTask[],
  comments: GPComment[],
  activities: GPActivity[]
): PerformanceMetrics[] {
  if (!tasks || tasks.length === 0) {
    return []
  }

  const tasksByEmployee = groupByEmployee(tasks)
  const metrics: PerformanceMetrics[] = []

  for (const [email, employeeTasks] of Object.entries(tasksByEmployee)) {
    // Skip if email is empty, invalid, or tasks array is invalid
    if (!email || typeof email !== 'string' || email.trim() === '' || !employeeTasks || employeeTasks.length === 0) {
      continue
    }

    const completedTasks = employeeTasks.filter(t => t.status === 'Completed' || t.status === 'Closed')
    const totalTasks = employeeTasks.length
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0

    const userComments = getCommentsByUser(comments, email)
    const userActivities = getActivitiesByUser(activities, email)

    // Calculate recent activity metrics (last 7 days) for individual performance views
    const activityWindowDays = 7
    const cutoffDate = getDaysAgo(activityWindowDays)
    const recentActivities = (userActivities || []).filter(a => {
      if (!a?.creation) return false
      const createdAt = new Date(a.creation)
      return createdAt >= cutoffDate
    })

    const activeDaysSet = new Set<string>()
    recentActivities.forEach(a => {
      if (a?.creation) {
        activeDaysSet.add(new Date(a.creation).toDateString())
      }
    })

    const recentActivitiesCount = recentActivities.length
    const activeDaysCount = activeDaysSet.size
    const avgActivitiesPerDay =
      activityWindowDays > 0 ? Math.round((recentActivitiesCount / activityWindowDays) * 100) / 100 : 0

    // Calculate score (weighted: 50% completion, 30% activity, 20% comments)
    const activityScore = Math.min(userActivities.length / 10, 1) * 30 // Normalize to 30 points max
    const commentScore = Math.min(userComments.length / 5, 1) * 20 // Normalize to 20 points max
    const completionScore = (completionRate / 100) * 50 // 50 points max

    const score = Math.round((completionScore + activityScore + commentScore) * 100) / 100

    // Find last activity date
    const lastActivity = userActivities
      .filter(a => a.creation)
      .sort((a, b) => new Date(b.creation!).getTime() - new Date(a.creation!).getTime())[0]

    // Ensure email is trimmed and valid
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      continue
    }

    metrics.push({
      employee: { email: trimmedEmail },
      score: isNaN(score) || !isFinite(score) ? 0 : score,
      rank: 0, // Will be set after sorting
      tasksCompleted: completedTasks.length,
      tasksTotal: totalTasks,
      commentsCount: userComments.length,
      activitiesCount: userActivities.length,
      lastActivityDate: lastActivity?.creation,
      trend: 'stable', // Will be calculated with historical data
      activityWindowDays,
      recentActivitiesCount,
      activeDaysCount,
      avgActivitiesPerDay
    })
  }

  // Sort by score and assign ranks
  metrics.sort((a, b) => b.score - a.score)
  
  // Filter out any invalid metrics before assigning ranks
  const validMetrics = metrics.filter(m => 
    m && 
    m.employee && 
    m.employee.email && 
    typeof m.employee.email === 'string' && 
    m.employee.email.trim() !== ''
  )
  
  // Assign ranks only to valid metrics
  validMetrics.forEach((metric, index) => {
    metric.rank = index + 1
  })

  return validMetrics
}

export function calculateRiskIndicators(
  tasks: GPTask[],
  activities: GPActivity[]
): RiskIndicator[] {
  const tasksByEmployee = groupByEmployee(tasks)
  const backlogTasks = getBacklogTasks(tasks)
  const backlogByEmployee = groupByEmployee(backlogTasks)
  const activitiesToday = getActivitiesToday(activities)
  const activeEmployees = new Set(activitiesToday.map(a => a.owner).filter(Boolean))

  const indicators: RiskIndicator[] = []

  // Overdue tasks
  const overdueEmployees = Object.entries(backlogByEmployee)
    .filter(([_, tasks]) => tasks.length > 0)
    .map(([email, tasks]) => ({
      email,
      name: undefined,
      reason: `${tasks.length} overdue task(s)`,
      severity: (tasks.length > 5 ? 'high' : tasks.length > 2 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
    }))

  indicators.push({
    category: 'overdue',
    count: overdueEmployees.length,
    employees: overdueEmployees
  })

  // Inactive employees (no activity today and has tasks)
  const inactiveEmployees = Object.entries(tasksByEmployee)
    .filter(([email, tasks]) => tasks.length > 0 && !activeEmployees.has(email))
    .map(([email]) => ({
      email,
      name: undefined,
      reason: 'No activity today',
      severity: 'medium' as const
    }))

  indicators.push({
    category: 'inactive',
    count: inactiveEmployees.length,
    employees: inactiveEmployees
  })

  // Overloaded employees (too many tasks)
  const overloadedEmployees = Object.entries(tasksByEmployee)
    .filter(([_, tasks]) => tasks.length > 20)
    .map(([email, tasks]) => ({
      email,
      name: undefined,
      reason: `${tasks.length} active tasks`,
      severity: (tasks.length > 30 ? 'high' : 'medium') as 'low' | 'medium' | 'high'
    }))

  indicators.push({
    category: 'overloaded',
    count: overloadedEmployees.length,
    employees: overloadedEmployees
  })

  // Low performers (low completion rate)
  const lowPerformers = Object.entries(tasksByEmployee)
    .map(([email, tasks]) => {
      const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length
      const rate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0
      return { email, tasks, rate }
    })
    .filter(({ rate, tasks }) => tasks.length >= 5 && rate < 30)
    .map(({ email, rate }) => ({
      email,
      name: undefined,
      reason: `${Math.round(rate)}% completion rate`,
      severity: (rate < 10 ? 'high' : 'medium') as 'low' | 'medium' | 'high'
    }))

  indicators.push({
    category: 'low_performers',
    count: lowPerformers.length,
    employees: lowPerformers
  })

  // Burnout risk (many overdue + high task count)
  const burnoutRisk = Object.entries(tasksByEmployee)
    .map(([email, tasks]) => {
      const overdue = backlogByEmployee[email]?.length || 0
      return { email, tasks, overdue }
    })
    .filter(({ tasks, overdue }) => tasks.length > 15 && overdue > 3)
    .map(({ email, overdue, tasks }) => ({
      email,
      name: undefined,
      reason: `${overdue} overdue out of ${tasks.length} tasks`,
      severity: 'high' as const
    }))

  indicators.push({
    category: 'burnout_risk',
    count: burnoutRisk.length,
    employees: burnoutRisk
  })

  return indicators
}

export function calculateTeamMetrics(
  tasks: GPTask[],
  teams: GPTeam[]
): TeamMetrics[] {
  const tasksByTeam: Record<string, GPTask[]> = {}
  const projectsByTeam: Record<string, string[]> = {}

  // Group tasks by team (via project)
  tasks.forEach(task => {
    if (task.project) {
      // We need to get team from project - this is a simplified version
      // In real implementation, you'd fetch projects and map them to teams
      const teamName = 'Unknown' // Placeholder
      if (!tasksByTeam[teamName]) {
        tasksByTeam[teamName] = []
      }
      tasksByTeam[teamName].push(task)
    }
  })

  return teams.map(team => {
    const teamTasks = tasksByTeam[team.name] || []
    const completedTasks = teamTasks.filter(t => t.status === 'Completed' || t.status === 'Closed')
    const overdueTasks = getBacklogTasks(teamTasks).length
    const completionRate = teamTasks.length > 0 ? (completedTasks.length / teamTasks.length) * 100 : 0

    // Get team employees
    const teamEmployees = new Set(teamTasks.map(t => t.assigned_to).filter(Boolean))

    // Calculate risk distribution
    const riskIndicators = calculateRiskIndicators(teamTasks, [])
    const riskDistribution = {
      overdue: riskIndicators.find(r => r.category === 'overdue')?.count || 0,
      inactive: riskIndicators.find(r => r.category === 'inactive')?.count || 0,
      overloaded: riskIndicators.find(r => r.category === 'overloaded')?.count || 0,
      lowPerformers: riskIndicators.find(r => r.category === 'low_performers')?.count || 0,
      burnoutRisk: riskIndicators.find(r => r.category === 'burnout_risk')?.count || 0
    }

    // Top performers (simplified - would need full metrics)
    const topPerformers = Array.from(teamEmployees).slice(0, 5).map(email => ({
      email,
      name: undefined,
      score: 0 // Would calculate from performance metrics
    }))

    return {
      teamName: team.name,
      teamTitle: team.title,
      totalEmployees: teamEmployees.size,
      totalTasks: teamTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks,
      averageCompletionRate: Math.round(completionRate * 100) / 100,
      riskDistribution,
      topPerformers
    }
  })
}

export function calculateTrends(tasks: GPTask[], days: number = 30): TrendData[] {
  const trends: TrendData[] = []
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = getDaysAgo(i)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const tasksOnDate = tasks.filter(task => {
      if (!task.modified) return false
      const modifiedDate = new Date(task.modified)
      return modifiedDate >= startOfDay && modifiedDate <= endOfDay
    })

    trends.push({
      date,
      value: tasksOnDate.length,
      label: date.toLocaleDateString()
    })
  }

  return trends
}

export function calculateActivityTrends(activities: GPActivity[], days: number = 7): TrendData[] {
  const trends: TrendData[] = []

  for (let i = days; i >= 0; i--) {
    const date = getDaysAgo(i)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const activitiesOnDate = (activities || []).filter(activity => {
      if (!activity?.creation) return false
      const createdAt = new Date(activity.creation)
      return createdAt >= startOfDay && createdAt <= endOfDay
    })

    trends.push({
      date,
      value: activitiesOnDate.length,
      label: date.toLocaleDateString()
    })
  }

  return trends
}

