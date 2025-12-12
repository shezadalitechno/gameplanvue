import { ref, watch } from 'vue'
import { QueryType } from '~/types/query'
import type { EmployeeQueryResult } from '~/types/query'
import { useQueryStore } from '~/stores/query'
import { useDataCacheStore } from '~/stores/dataCache'
import {
  getEmployeesNotUpdatedToday,
  getEmployeesNotUpdatedYesterday,
  getEmployeesNotCommentedToday,
  getEmployeesWithBacklog,
  getTaskCompletionRates,
  getTasksNotUpdatedByDateRange
} from './services/queryService'
import { getAllTasks, getAllComments, getAllActivities, getAllProjects, getAllTeams } from './services/api'

export function useEmployeeQueries(queryType: QueryType) {
  const queryStore = useQueryStore()
  const dataCacheStore = useDataCacheStore()

  const results = ref<EmployeeQueryResult[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function executeQuery() {
    loading.value = true
    error.value = null
    queryStore.setLoading(true)
    queryStore.setError(null)
    queryStore.setLastQueryType(queryType)

    try {
      // Ensure we have cached data
      if (dataCacheStore.isStale || dataCacheStore.tasks.length === 0) {
        const [tasks, comments, activities, projects, teams] = await Promise.all([
          getAllTasks(),
          getAllComments(),
          getAllActivities(),
          getAllProjects(),
          getAllTeams()
        ])

        dataCacheStore.setTasks(tasks)
        dataCacheStore.setComments(comments)
        dataCacheStore.setActivities(activities)
        dataCacheStore.setProjects(projects)
        dataCacheStore.setTeams(teams)
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
          throw new Error(`Unknown query type: ${queryType}`)
      }

      results.value = queryResults
      queryStore.setResults(queryResults)
    } catch (err: any) {
      error.value = err
      queryStore.setError(err)
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

