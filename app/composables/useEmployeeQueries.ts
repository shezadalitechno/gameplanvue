import { ref, watch } from 'vue'
import { QueryType } from '~/types/query'
import type { EmployeeQueryResult } from '~/types/query'
import type { GPUserProfile } from '~/types/gameplan'
import { useQueryStore } from '~/stores/query'
import { useDataCacheStore } from '~/stores/dataCache'
import { useApiStore } from '~/stores/api'
import {
  getEmployeesNotUpdatedToday,
  getEmployeesNotUpdatedYesterday,
  getEmployeesNotCommentedToday,
  getEmployeesWithBacklog,
  getTaskCompletionRates,
  getTasksNotUpdatedByDateRange
} from './services/queryService'
import { getAllTasks, getAllComments, getAllActivities, getAllProjects, getAllTeams, getAllUserProfiles } from './services/api'
import { createUserFriendlyError, isApiKeyError, createSerializableError } from './utils/errorUtils'

export function useEmployeeQueries(queryType: QueryType) {
  const queryStore = useQueryStore()
  const dataCacheStore = useDataCacheStore()

  const results = ref<EmployeeQueryResult[]>([])
  const loading = ref(false)
  const error = ref<Record<string, any> | null>(null)

  async function executeQuery() {
    loading.value = true
    error.value = null
    queryStore.setLoading(true)
    queryStore.setError(null)
    queryStore.setLastQueryType(queryType)

    try {
      // Check API key before making calls
      const apiStore = useApiStore()
      if (typeof window !== 'undefined') {
        apiStore.loadApiKey()
      }
      
      if (!apiStore.apiKey) {
        throw createSerializableError('API key is required. Please configure it in settings.', 401)
      }

      // Ensure we have cached data
      if (dataCacheStore.isStale || dataCacheStore.tasks.length === 0) {
        const [tasks, comments, activities, projects, teams, userProfiles] = await Promise.allSettled([
          getAllTasks(),
          getAllComments(),
          getAllActivities(),
          getAllProjects(),
          getAllTeams(),
          getAllUserProfiles()
        ])

        // Handle results with error checking
        const tasksResult = tasks.status === 'fulfilled' ? tasks.value : []
        const commentsResult = comments.status === 'fulfilled' ? comments.value : []
        const activitiesResult = activities.status === 'fulfilled' ? activities.value : []
        const projectsResult = projects.status === 'fulfilled' ? projects.value : []
        const teamsResult = teams.status === 'fulfilled' ? teams.value : []

        // Check for API key errors
        const failedResults = [tasks, comments, activities, projects, teams, userProfiles]
          .filter(r => r.status === 'rejected' && isApiKeyError(r.reason))
        
        if (failedResults.length > 0) {
          throw createUserFriendlyError(failedResults[0].reason)
        }

        dataCacheStore.setTasks(tasksResult)
        dataCacheStore.setComments(commentsResult)
        dataCacheStore.setActivities(activitiesResult)
        dataCacheStore.setProjects(projectsResult)
        dataCacheStore.setTeams(teamsResult)
      }

      // Fetch user profiles if not cached
      const userProfilesResult = await getAllUserProfiles().catch(err => {
        if (isApiKeyError(err)) {
          throw createUserFriendlyError(err)
        }
        console.warn('Failed to fetch user profiles:', err)
        return []
      })
      
      // Create a map of email to user profile for quick lookup
      const userProfileMap = new Map<string, GPUserProfile>()
      if (userProfilesResult && Array.isArray(userProfilesResult)) {
        userProfilesResult.forEach(profile => {
          if (profile?.email) {
            userProfileMap.set(profile.email.toLowerCase(), profile)
          }
        })
      }

      let queryResults: EmployeeQueryResult[] = []

      // Use cached data
      const cachedTasks = dataCacheStore.tasks
      const cachedComments = dataCacheStore.comments
      const cachedProjects = dataCacheStore.projects

      switch (queryType) {
        case QueryType.NOT_UPDATED_TODAY:
          queryResults = await getEmployeesNotUpdatedToday(queryStore.filters, cachedTasks, cachedProjects)
          break
        case QueryType.NOT_UPDATED_YESTERDAY:
          queryResults = await getEmployeesNotUpdatedYesterday(queryStore.filters, cachedTasks, cachedProjects)
          break
        case QueryType.NOT_COMMENTED_TODAY:
          queryResults = await getEmployeesNotCommentedToday(queryStore.filters, cachedTasks, cachedComments, cachedProjects)
          break
        case QueryType.BACKLOG:
          queryResults = await getEmployeesWithBacklog(queryStore.filters, cachedTasks, cachedProjects)
          break
        case QueryType.COMPLETION_RATE:
          queryResults = await getTaskCompletionRates(queryStore.filters, cachedTasks, cachedProjects)
          break
        case QueryType.TASKS_BY_DATE:
          if (queryStore.filters.startDate && queryStore.filters.endDate) {
            queryResults = await getTasksNotUpdatedByDateRange(
              queryStore.filters.startDate,
              queryStore.filters.endDate,
              queryStore.filters,
              cachedTasks,
              cachedProjects
            )
          }
          break
        default:
          throw createSerializableError(`Unknown query type: ${queryType}`)
      }

      // Enrich results with user profile data (names)
      const enrichedResults = (queryResults || []).map(result => {
        if (!result || !result.employee) return result
        
        const email = result.employee.email
        if (email) {
          const profile = userProfileMap.get(email.toLowerCase())
          if (profile) {
            return {
              ...result,
              employee: {
                ...result.employee,
                name: profile.name || email,
                full_name: profile.full_name || profile.name || email
              }
            }
          }
        }
        return result
      })

      results.value = enrichedResults
      queryStore.setResults(enrichedResults)
    } catch (err: any) {
      const friendlyError = createUserFriendlyError(err)
      error.value = friendlyError
      // Store as plain object in store too
      queryStore.setError(friendlyError)
      console.error('Query execution failed:', err)
    } finally {
      loading.value = false
      queryStore.setLoading(false)
    }
  }

  async function refetch() {
    // Clear cache to force fresh data
    dataCacheStore.clearCache()
    await executeQuery()
  }

  // Watch for filter changes and re-execute
  watch(
    () => queryStore.filters,
    () => {
      executeQuery()
    },
    { deep: true }
  )

  // Execute query on mount
  executeQuery()

  return {
    results,
    loading,
    error,
    refetch
  }
}

