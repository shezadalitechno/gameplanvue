<script setup lang="ts">
import { getAllTasks, getAllComments, getAllActivities, getAllTeams, getAllUserProfiles } from '~/composables/services/api'
import type { GPUserProfile } from '~/types/gameplan'
import { calculatePerformanceMetrics, calculateRiskIndicators, calculateTeamMetrics, calculateTrends } from '~/composables/services/performanceService'
import { useDataCacheStore } from '~/stores/dataCache'

const dataCacheStore = useDataCacheStore()
const loading = ref(true)
const error = ref<Error | null>(null)

let tasks: any[] = []
let comments: any[] = []
let activities: any[] = []
let teams: any[] = []
let userProfiles: GPUserProfile[] = []
let performanceMetrics: any[] = []
let riskIndicators: any[] = []
let teamMetrics: any[] = []
let trends: any[] = []

try {
  // Fetch data including user profiles
  const [tasksData, commentsData, activitiesData, teamsData, userProfilesData] = await Promise.all([
    getAllTasks().catch(() => []),
    getAllComments().catch(() => []),
    getAllActivities().catch(() => []),
    getAllTeams().catch(() => []),
    getAllUserProfiles().catch(() => [])
  ])

  tasks = tasksData
  comments = commentsData
  activities = activitiesData
  teams = teamsData
  userProfiles = userProfilesData

  // Cache data
  dataCacheStore.setTasks(tasks)
  dataCacheStore.setComments(comments)
  dataCacheStore.setActivities(activities)
  dataCacheStore.setTeams(teams)

  // Create a map of email to user profile for quick lookup
  const userProfileMap = new Map<string, GPUserProfile>()
  userProfiles.forEach(profile => {
    if (profile.email) {
      userProfileMap.set(profile.email.toLowerCase(), profile)
    }
  })

  // Calculate metrics
  performanceMetrics = calculatePerformanceMetrics(tasks, comments, activities)
  
  // Enrich performance metrics with user profile data (names)
  performanceMetrics = performanceMetrics.map(metric => {
    const email = metric.employee?.email
    if (email) {
      const profile = userProfileMap.get(email.toLowerCase())
      if (profile) {
        return {
          ...metric,
          employee: {
            ...metric.employee,
            name: profile.name,
            full_name: profile.full_name || profile.name
          }
        }
      }
    }
    return metric
  })

  riskIndicators = calculateRiskIndicators(tasks, activities)
  
  // Enrich risk indicators with user profile data
  riskIndicators = riskIndicators.map(indicator => ({
    ...indicator,
    employees: indicator.employees.map(emp => {
      const profile = userProfileMap.get(emp.email?.toLowerCase() || '')
      if (profile) {
        return {
          ...emp,
          name: profile.name,
          full_name: profile.full_name || profile.name
        }
      }
      return emp
    })
  }))

  teamMetrics = calculateTeamMetrics(tasks, teams)
  trends = calculateTrends(tasks, 30)
} catch (err: any) {
  error.value = err
  console.error('Performance page data loading error:', err)
} finally {
  loading.value = false
}
</script>

<template>
  <UDashboardPanel id="performance">
    <template #header>
      <UDashboardNavbar title="Performance Analytics">
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
        <!-- Executive Summary -->
        <div>
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-highlighted">Executive Summary</h2>
            <p class="text-sm text-muted mt-1">Key performance indicators at a glance</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsKpiCard
              title="Total Employees"
              :value="performanceMetrics?.length || 0"
              icon="i-lucide-users"
              color="primary"
            />
            <AnalyticsKpiCard
              title="Total Tasks"
              :value="tasks?.length || 0"
              icon="i-lucide-check-square"
              color="primary"
            />
            <AnalyticsKpiCard
              title="Risk Indicators"
              :value="riskIndicators?.reduce((sum, r) => sum + r.count, 0) || 0"
              icon="i-lucide-alert-triangle"
              color="error"
            />
            <AnalyticsKpiCard
              title="Teams"
              :value="teams?.length || 0"
              icon="i-lucide-users-2"
              color="primary"
            />
          </div>
        </div>

        <!-- Performance Leaderboard -->
        <div>
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-highlighted">Performance Leaderboard</h2>
            <p class="text-sm text-muted mt-1">Top and bottom performers</p>
          </div>
          <AnalyticsPerformanceLeaderboard :metrics="performanceMetrics || []" />
        </div>

        <!-- Performance Trends -->
        <div>
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-highlighted">Performance Trends</h2>
            <p class="text-sm text-muted mt-1">30-day activity trend</p>
          </div>
          <AnalyticsPerformanceTrends :trends="trends || []" />
        </div>

        <!-- Risk Indicators -->
        <div>
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-highlighted">Risk Indicators</h2>
            <p class="text-sm text-muted mt-1">Employees requiring attention</p>
          </div>
          <AnalyticsRiskIndicators :indicators="riskIndicators || []" />
        </div>

        <!-- Task Distribution -->
        <div>
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-highlighted">Task Distribution</h2>
            <p class="text-sm text-muted mt-1">Tasks by status and priority</p>
          </div>
          <AnalyticsTaskDistributionCharts :tasks="tasks || []" />
        </div>

        <!-- Team Overview -->
        <div>
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-highlighted">Team Overview</h2>
            <p class="text-sm text-muted mt-1">Team-level metrics and performance</p>
          </div>
          <AnalyticsTeamOverview :teams="teamMetrics || []" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

