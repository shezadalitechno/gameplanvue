import type { GPActivity } from '~/types/gameplan'
import { isToday, isInRange } from '../utils/dateUtils'
import { getAllActivities as apiGetAllActivities } from './api'

export function getAllActivities(): Promise<GPActivity[]> {
  return apiGetAllActivities()
}

export function getActivitiesByUser(activities: GPActivity[], email: string): GPActivity[] {
  return activities.filter(activity => activity.owner === email)
}

export function getActivitiesToday(activities: GPActivity[]): GPActivity[] {
  return activities.filter(activity => {
    if (!activity.creation) return false
    return isToday(new Date(activity.creation))
  })
}

export function getActivitiesByType(activities: GPActivity[], action: string): GPActivity[] {
  return activities.filter(activity => activity.action === action)
}

export function getActivitiesInRange(activities: GPActivity[], startDate: Date, endDate: Date): GPActivity[] {
  return activities.filter(activity => {
    if (!activity.creation) return false
    return isInRange(new Date(activity.creation), startDate, endDate)
  })
}

