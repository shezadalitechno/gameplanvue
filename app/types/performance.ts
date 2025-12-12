import type { GPUserProfile } from './gameplan'

export interface PerformanceMetrics {
  employee: GPUserProfile | { email: string; name?: string; full_name?: string }
  score: number
  rank: number
  tasksCompleted: number
  tasksTotal: number
  commentsCount: number
  activitiesCount: number
  lastActivityDate?: string
  trend?: 'improving' | 'declining' | 'stable'
}

export interface RiskIndicator {
  category: 'overdue' | 'inactive' | 'overloaded' | 'low_performers' | 'burnout_risk'
  count: number
  employees: Array<{
    email: string
    name?: string
    reason: string
    severity: 'low' | 'medium' | 'high'
  }>
}

export interface TeamMetrics {
  teamName: string
  teamTitle?: string
  totalEmployees: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  averageCompletionRate: number
  riskDistribution: {
    overdue: number
    inactive: number
    overloaded: number
    lowPerformers: number
    burnoutRisk: number
  }
  topPerformers: Array<{
    email: string
    name?: string
    score: number
  }>
}

export interface TrendData {
  date: Date
  value: number
  label?: string
}

