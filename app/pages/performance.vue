<script setup lang="ts">
import { getAllTasks, getAllComments, getAllActivities, getAllTeams, getAllUserProfiles } from '~/composables/services/api'
import type { GPUserProfile } from '~/types/gameplan'
import type { PerformanceMetrics, TrendData } from '~/types/performance'
import { calculatePerformanceMetrics, calculateRiskIndicators, calculateTeamMetrics, calculateActivityTrends } from '~/composables/services/performanceService'
import { useDataCacheStore } from '~/stores/dataCache'
import { useApiStore } from '~/stores/api'
import { createSerializableError } from '~/composables/utils/errorUtils'

const dataCacheStore = useDataCacheStore()
const loading = ref(true)
const error = ref<Record<string, any> | null>(null)

let tasks: any[] = []
let comments: any[] = []
let activities: any[] = []
let teams: any[] = []
let userProfiles: GPUserProfile[] = []
let performanceMetrics: PerformanceMetrics[] = []
let riskIndicators: any[] = []
let teamMetrics: any[] = []
let activityTrends: TrendData[] = []

try {
  // Check API key before making calls
  const apiStore = useApiStore()
  if (typeof window !== 'undefined') {
    apiStore.loadApiKey()
  }
  
  if (!apiStore.apiKey) {
    throw createSerializableError('API key is required. Please configure it in settings.', 401)
  }

  // Fetch data including user profiles with proper error handling
  const [tasksData, commentsData, activitiesData, teamsData, userProfilesData] = await Promise.allSettled([
    getAllTasks(),
    getAllComments(),
    getAllActivities(),
    getAllTeams(),
    getAllUserProfiles()
  ])

  // Handle each result with null safety
  tasks = tasksData.status === 'fulfilled' ? (tasksData.value || []) : []
  comments = commentsData.status === 'fulfilled' ? (commentsData.value || []) : []
  activities = activitiesData.status === 'fulfilled' ? (activitiesData.value || []) : []
  teams = teamsData.status === 'fulfilled' ? (teamsData.value || []) : []
  userProfiles = userProfilesData.status === 'fulfilled' ? (userProfilesData.value || []) : []

  // Check if any critical API calls failed due to authentication
  const failedResults = [tasksData, commentsData, activitiesData, teamsData, userProfilesData]
    .filter(r => r.status === 'rejected' && (
      r.reason?.message?.includes('API key') || 
      r.reason?.statusCode === 401
    ))
  
  if (failedResults.length > 0) {
    throw failedResults[0].reason
  }

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
  performanceMetrics = (performanceMetrics || []).map(metric => {
    if (!metric || !metric.employee) return metric
    
    const email = metric.employee?.email
    if (email) {
      const profile = userProfileMap.get(email.toLowerCase())
      if (profile) {
        return {
          ...metric,
          employee: {
            ...metric.employee,
            name: profile.name || email,
            full_name: profile.full_name || profile.name || email
          }
        }
      }
    }
    return metric
  })

  riskIndicators = calculateRiskIndicators(tasks || [], activities || [])
  
  // Enrich risk indicators with user profile data
  riskIndicators = (riskIndicators || []).map(indicator => ({
    ...indicator,
    employees: (indicator.employees || []).map(emp => {
      if (!emp || !emp.email) return emp
      
      const profile = userProfileMap.get(emp.email.toLowerCase())
      if (profile) {
        return {
          ...emp,
          name: profile.name || emp.email,
          full_name: profile.full_name || profile.name || emp.email
        }
      }
      return emp
    })
  }))

  teamMetrics = calculateTeamMetrics(tasks || [], teams || [])
  activityTrends = calculateActivityTrends(activities || [], 7)
} catch (err: any) {
  // Convert error to plain object for serialization
  error.value = {
    message: err?.message || err?.statusMessage || 'An error occurred',
    statusCode: err?.statusCode,
    statusMessage: err?.statusMessage,
    data: err?.data,
    stack: err?.stack
  }
  console.error('Performance page data loading error:', err)
} finally {
  loading.value = false
}

const totalEmployees = computed(() =>
  (teamMetrics || []).reduce((sum, team) => sum + (team.totalEmployees || 0), 0)
)
</script>

<template>
  <UDashboardPanel id="performance" class="overflow-y-auto">
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
        <!-- Executive Summary (team-level) -->
        <div>
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-highlighted">Team Performance Overview</h2>
            <p class="text-sm text-muted mt-1">Key organisation-wide indicators at a glance</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsKpiCard
              title="Total Teams"
              :value="teams?.length || 0"
              icon="i-lucide-users-2"
              color="primary"
            />
            <AnalyticsKpiCard
              title="Total Employees"
              :value="totalEmployees || 0"
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
              title="Open Risk Indicators"
              :value="riskIndicators?.reduce((sum, r) => sum + r.count, 0) || 0"
              icon="i-lucide-alert-triangle"
              color="error"
            />
          </div>
        </div>

        <!-- Activity Trends (org-level) -->
        <div>
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-highlighted">Activity Trends</h2>
            <p class="text-sm text-muted mt-1">Daily activity volume across all teams (last 7 days)</p>
          </div>
          <AnalyticsPerformanceTrends :trends="activityTrends || []" />
        </div>

        <!-- Risk Indicators -->
        <div>
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-highlighted">Risk Indicators</h2>
            <p class="text-sm text-muted mt-1">Employees and areas requiring attention</p>
          </div>
          <AnalyticsRiskIndicators :indicators="riskIndicators || []" />
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


