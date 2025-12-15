<script setup lang="ts">
import { QueryType } from '~/types/query'
import { getAllTasks, getAllComments } from '~/composables/services/api'
import { getEmployeesNotUpdatedToday, getEmployeesNotCommentedToday, getEmployeesWithBacklog, getTaskCompletionRates } from '~/composables/services/queryService'
import { useDataCacheStore } from '~/stores/dataCache'
import { useApiStore } from '~/stores/api'
import { createSerializableError } from '~/composables/utils/errorUtils'

const dataCacheStore = useDataCacheStore()
const loading = ref(true)
const error = ref<Record<string, any> | null>(null)

let tasks: any[] = []
let comments: any[] = []
let notUpdatedToday: any[] = []
let notCommentedToday: any[] = []
let backlog: any[] = []
let completionRates: any[] = []

try {
  // Check API key before making calls
  const apiStore = useApiStore()
  if (typeof window !== 'undefined') {
    apiStore.loadApiKey()
  }
  
  if (!apiStore.apiKey) {
    throw createSerializableError('API key is required. Please configure it in settings.', 401)
  }

  // Fetch data in parallel with proper error handling
  const [tasksData, commentsData] = await Promise.allSettled([
    getAllTasks(),
    getAllComments()
  ])

  // Handle tasks result
  if (tasksData.status === 'fulfilled') {
    tasks = tasksData.value || []
  } else {
    console.error('Failed to fetch tasks:', tasksData.reason)
    const reason = tasksData.reason
    // Throw immediately if it's an API key error
    if (reason?.message?.includes('API key') || reason?.statusCode === 401) {
      throw reason
    }
    // Otherwise, continue with empty array but log the error
    tasks = []
  }

  // Handle comments result
  if (commentsData.status === 'fulfilled') {
    comments = commentsData.value || []
  } else {
    console.error('Failed to fetch comments:', commentsData.reason)
    const reason = commentsData.reason
    // Throw immediately if it's an API key error
    if (reason?.message?.includes('API key') || reason?.statusCode === 401) {
      throw reason
    }
    // Otherwise, continue with empty array but log the error
    comments = []
  }

  // Cache data
  dataCacheStore.setTasks(tasks)
  dataCacheStore.setComments(comments)

  // Calculate KPIs in parallel with proper error handling
  const [notUpdatedTodayData, notCommentedTodayData, backlogData, completionRatesData] = await Promise.allSettled([
    getEmployeesNotUpdatedToday(undefined, tasks),
    getEmployeesNotCommentedToday(undefined, tasks, comments),
    getEmployeesWithBacklog(undefined, tasks),
    getTaskCompletionRates(undefined, tasks)
  ])

  notUpdatedToday = notUpdatedTodayData.status === 'fulfilled' ? notUpdatedTodayData.value : []
  notCommentedToday = notCommentedTodayData.status === 'fulfilled' ? notCommentedTodayData.value : []
  backlog = backlogData.status === 'fulfilled' ? backlogData.value : []
  completionRates = completionRatesData.status === 'fulfilled' ? completionRatesData.value : []
} catch (err: any) {
  // Convert error to plain object for serialization
  error.value = {
    message: err?.message || err?.statusMessage || 'An error occurred',
    statusCode: err?.statusCode,
    statusMessage: err?.statusMessage,
    data: err?.data,
    stack: err?.stack
  }
  console.error('Dashboard data loading error:', err)
} finally {
  loading.value = false
}

const totalBacklogTasks = computed(() => {
  if (!backlog || backlog.length === 0) return 0
  return backlog.reduce((sum, emp) => sum + (emp.backlogCount || 0), 0)
})

const avgCompletionRate = computed(() => {
  if (!completionRates || completionRates.length === 0) return 0
  const total = completionRates.reduce((sum, emp) => sum + (emp.completionRate || 0), 0)
  const average = total / completionRates.length
  return isNaN(average) || !isFinite(average) ? 0 : average
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="GamePlan Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
      </div>

      <CommonErrorDebugPanel
        v-else-if="error"
        :error="error"
      />

      <div v-else class="space-y-8">
        <!-- KPI Summary Cards -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-highlighted">Key Metrics</h2>
              <p class="text-sm text-muted mt-1">Overview of employee activity and task status</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsKpiCard
              title="Not Updated Today"
              :value="notUpdatedToday?.length || 0"
              icon="i-lucide-user-x"
              color="warning"
              :to="'/reports/not-updated-today'"
              subtitle="Employees"
            />
            <AnalyticsKpiCard
              title="Not Commented Today"
              :value="notCommentedToday?.length || 0"
              icon="i-lucide-message-square-x"
              color="warning"
              :to="'/reports/not-commented-today'"
              subtitle="Employees"
            />
            <AnalyticsKpiCard
              title="Backlog Tasks"
              :value="totalBacklogTasks"
              icon="i-lucide-alert-circle"
              color="error"
              :to="'/reports/backlog'"
              subtitle="Overdue tasks"
            />
            <AnalyticsKpiCard
              title="Avg Completion Rate"
              :value="`${(avgCompletionRate ?? 0).toFixed(1)}%`"
              icon="i-lucide-trending-up"
              color="success"
              :to="'/reports/completion-rate'"
              subtitle="Task completion"
            />
          </div>
        </div>

        <!-- Quick Stats -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Statistics</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UCard class="hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between p-2">
                <div>
                  <p class="text-sm font-medium text-muted mb-1">Total Tasks</p>
                  <p class="text-3xl font-bold text-highlighted">{{ tasks?.length || 0 }}</p>
                </div>
                <div class="p-3 rounded-lg bg-primary/10">
                  <UIcon name="i-lucide-check-square" class="size-8 text-primary" />
                </div>
              </div>
            </UCard>

            <UCard class="hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between p-2">
                <div>
                  <p class="text-sm font-medium text-muted mb-1">Total Comments</p>
                  <p class="text-3xl font-bold text-highlighted">{{ comments?.length || 0 }}</p>
                </div>
                <div class="p-3 rounded-lg bg-success/10">
                  <UIcon name="i-lucide-message-square" class="size-8 text-success" />
                </div>
              </div>
            </UCard>

            <UCard class="hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between p-2">
                <div>
                  <p class="text-sm font-medium text-muted mb-1">Employees with Backlog</p>
                  <p class="text-3xl font-bold text-highlighted">{{ backlog?.length || 0 }}</p>
                </div>
                <div class="p-3 rounded-lg bg-error/10">
                  <UIcon name="i-lucide-alert-triangle" class="size-8 text-error" />
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
