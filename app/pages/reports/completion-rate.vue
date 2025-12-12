<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { QueryType } from '~/types/query'
import type { TableColumn } from '@nuxt/ui'
import { useEmployeeQueries } from '~/composables/useEmployeeQueries'
import { formatPercentage } from '~/composables/utils/formatters'

const { results, loading, error, refetch } = useEmployeeQueries(QueryType.COMPLETION_RATE)

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

// Transform data for table
const tableData = computed(() => {
  return results.value.map((result) => ({
    employeeName: result.employee.name || result.employee.full_name || result.employee.email,
    employeeEmail: result.employee.email,
    totalTasks: result.metrics?.totalTasks || result.taskCount || 0,
    completedTasks: result.metrics?.completedTasks || 0,
    inProgressTasks: result.metrics?.inProgressTasks || 0,
    completionRate: result.completionRate || 0
  }))
})

// Summary metrics
const summaryMetrics = computed(() => {
  const total = results.value.length
  const avgCompletionRate = results.value.length > 0
    ? results.value.reduce((sum, r) => sum + (r.completionRate || 0), 0) / results.value.length
    : 0
  const totalTasks = results.value.reduce((sum, r) => sum + (r.metrics?.totalTasks || r.taskCount || 0), 0)
  const totalCompleted = results.value.reduce((sum, r) => sum + (r.metrics?.completedTasks || 0), 0)
  
  return {
    totalEmployees: total,
    avgCompletionRate: Math.round(avgCompletionRate * 100) / 100,
    totalTasks,
    totalCompleted
  }
})

// Define table columns
const columns: TableColumn<typeof tableData.value[0]>[] = [
  {
    accessorKey: 'employeeName',
    header: 'Employee',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, {
          alt: row.original.employeeName,
          size: 'sm'
        }),
        h('div', { class: 'flex flex-col' }, [
          h('span', { class: 'font-medium text-highlighted' }, row.original.employeeName),
          h('span', { class: 'text-sm text-muted' }, row.original.employeeEmail)
        ])
      ])
    }
  },
  {
    accessorKey: 'completionRate',
    header: 'Completion Rate',
    cell: ({ row }) => {
      const rate = row.original.completionRate
      const color = rate < 50 ? 'error' : rate < 75 ? 'warning' : 'success'
      return h('div', { class: 'text-center' }, h(UBadge, {
        label: formatPercentage(rate),
        variant: 'subtle',
        color,
        size: 'sm'
      }))
    }
  },
  {
    accessorKey: 'totalTasks',
    header: 'Total Tasks',
    cell: ({ row }) => {
      return h('div', { class: 'text-center' }, row.original.totalTasks.toString())
    }
  },
  {
    accessorKey: 'completedTasks',
    header: 'Completed',
    cell: ({ row }) => {
      return h('div', { class: 'text-center text-success' }, row.original.completedTasks.toString())
    }
  },
  {
    accessorKey: 'inProgressTasks',
    header: 'In Progress',
    cell: ({ row }) => {
      return h('div', { class: 'text-center text-muted' }, row.original.inProgressTasks.toString())
    }
  }
]
</script>

<template>
  <UDashboardPanel id="completion-rate">
    <template #header>
      <UDashboardNavbar title="Task Completion Rates">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            :loading="loading"
            @click="refetch"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <ReportsReportFilters
            :show-team-filter="true"
            :show-project-filter="true"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <CommonErrorDebugPanel
        v-if="error"
        :error="error"
      />

      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>

      <CommonEmptyDataState
        v-else-if="!loading && results.length === 0"
        title="No data available"
        description="No task completion data found."
        icon="i-lucide-inbox"
      />

      <div v-else class="space-y-4">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <UIcon name="i-lucide-users" class="size-5 text-primary" />
              </div>
              <div>
                <p class="text-sm text-muted">Employees</p>
                <p class="text-2xl font-semibold">{{ summaryMetrics.totalEmployees }}</p>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-success/10 rounded-lg">
                <UIcon name="i-lucide-trending-up" class="size-5 text-success" />
              </div>
              <div>
                <p class="text-sm text-muted">Avg Completion</p>
                <p class="text-2xl font-semibold">{{ formatPercentage(summaryMetrics.avgCompletionRate) }}</p>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-info/10 rounded-lg">
                <UIcon name="i-lucide-check-square" class="size-5 text-info" />
              </div>
              <div>
                <p class="text-sm text-muted">Total Tasks</p>
                <p class="text-2xl font-semibold">{{ summaryMetrics.totalTasks }}</p>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-success/10 rounded-lg">
                <UIcon name="i-lucide-check-circle-2" class="size-5 text-success" />
              </div>
              <div>
                <p class="text-sm text-muted">Completed</p>
                <p class="text-2xl font-semibold">{{ summaryMetrics.totalCompleted }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Employee Summary Widget -->
        <UCard>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <UUser
              v-for="(result, index) in results"
              :key="index"
              :name="result.employee.name || result.employee.full_name || result.employee.email"
              :avatar="{
                alt: result.employee.name || result.employee.full_name || result.employee.email
              }"
              :chip="{
                text: formatPercentage(result.completionRate || 0),
                color: (result.completionRate || 0) < 50 ? 'error' : (result.completionRate || 0) < 75 ? 'warning' : 'success',
                position: 'top-right'
              }"
              size="sm"
            />
          </div>
        </UCard>

        <!-- Table -->
        <UTable
          :data="tableData"
          :columns="columns"
          class="flex-1"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

