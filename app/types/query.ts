import type { GPUserProfile } from './gameplan'

export enum QueryType {
  NOT_UPDATED_TODAY = 'NOT_UPDATED_TODAY',
  NOT_UPDATED_YESTERDAY = 'NOT_UPDATED_YESTERDAY',
  TASKS_BY_DATE = 'TASKS_BY_DATE',
  NOT_COMMENTED_TODAY = 'NOT_COMMENTED_TODAY',
  BACKLOG = 'BACKLOG',
  COMPLETION_RATE = 'COMPLETION_RATE'
}

export interface QueryFilters {
  team?: string
  project?: string
  startDate?: Date
  endDate?: Date
}

export interface EmployeeQueryResult {
  employee: GPUserProfile | { email: string; name?: string; full_name?: string }
  taskCount?: number
  backlogCount?: number
  completionRate?: number
  lastUpdateDate?: string
  lastCommentDate?: string
  tasks?: any[]
  metrics?: {
    totalTasks?: number
    completedTasks?: number
    overdueTasks?: number
    inProgressTasks?: number
  }
}

