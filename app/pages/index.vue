<script setup lang="ts">
import { QueryType } from '~/types/query'
import { getAllTasks, getAllComments } from '~/composables/services/api'
import { getEmployeesNotUpdatedToday, getEmployeesNotCommentedToday, getEmployeesWithBacklog, getTaskCompletionRates } from '~/composables/services/queryService'
import { useDataCacheStore } from '~/stores/dataCache'

const dataCacheStore = useDataCacheStore()
const loading = ref(true)
const error = ref<Error | null>(null)

let tasks: any[] = []
let comments: any[] = []
let notUpdatedToday: any[] = []
let notCommentedToday: any[] = []
let backlog: any[] = []
let completionRates: any[] = []

try {
  // Fetch data in parallel
  const [tasksData, commentsData] = await Promise.all([
    getAllTasks().catch(() => []),
    getAllComments().catch(() => [])
  ])

  tasks = tasksData
  comments = commentsData

  // Cache data
  dataCacheStore.setTasks(tasks)
  dataCacheStore.setComments(comments)

  // Calculate KPIs in parallel
  const [notUpdatedTodayData, notCommentedTodayData, backlogData, completionRatesData] = await Promise.all([
    getEmployeesNotUpdatedToday(undefined, tasks).catch(() => []),
    getEmployeesNotCommentedToday(undefined, tasks, comments).catch(() => []),
    getEmployeesWithBacklog(undefined, tasks).catch(() => []),
    getTaskCompletionRates(undefined, tasks).catch(() => [])
  ])

  notUpdatedToday = notUpdatedTodayData
  notCommentedToday = notCommentedTodayData
  backlog = backlogData
  completionRates = completionRatesData
} catch (err: any) {
  error.value = err
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
  return total / completionRates.length
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
              :value="`${avgCompletionRate.toFixed(1)}%`"
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
