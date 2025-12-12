<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { QueryType } from '~/types/query'
import type { TableColumn } from '@nuxt/ui'
import { useEmployeeQueries } from '~/composables/useEmployeeQueries'
import { useQueryStore } from '~/stores/query'
import { sub } from 'date-fns'
import { formatDate, formatRelativeDate } from '~/composables/utils/formatters'

const queryStore = useQueryStore()

// Set default date range (last 7 days)
if (!queryStore.filters.startDate || !queryStore.filters.endDate) {
  queryStore.setFilters({
    startDate: sub(new Date(), { days: 7 }),
    endDate: new Date()
  })
}

const { results, loading, error, refetch } = useEmployeeQueries(QueryType.TASKS_BY_DATE)

function updateDateRange(range: { start: Date; end: Date }) {
  queryStore.setFilters({
    startDate: range.start,
    endDate: range.end
  })
}

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

// Transform data for table
const tableData = computed(() => {
  return results.value.map((result) => ({
    employeeName: result.employee.name || result.employee.full_name || result.employee.email,
    employeeEmail: result.employee.email,
    totalTasks: result.taskCount || 0,
    tasksNotUpdated: result.tasks?.length || 0,
    lastUpdateDate: result.lastUpdateDate,
    taskList: result.tasks || []
  }))
})

// Summary metrics
const summaryMetrics = computed(() => {
  const totalEmployees = results.value.length
  const totalTasksNotUpdated = results.value.reduce((sum, r) => sum + (r.tasks?.length || 0), 0)
  const totalTasks = results.value.reduce((sum, r) => sum + (r.taskCount || 0), 0)
  const employeesWithIssues = results.value.filter(r => (r.tasks?.length || 0) > 0).length
  
  return {
    totalEmployees,
    totalTasksNotUpdated,
    totalTasks,
    employeesWithIssues
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
    accessorKey: 'tasksNotUpdated',
    header: 'Tasks Not Updated',
    cell: ({ row }) => {
      const count = row.original.tasksNotUpdated
      if (count === 0) return h('div', { class: 'text-center text-muted' }, '0')
      return h('div', { class: 'text-center' }, h(UBadge, {
        label: count.toString(),
        variant: 'subtle',
        color: 'warning',
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
    accessorKey: 'lastUpdateDate',
    header: 'Last Update',
    cell: ({ row }) => {
      const date = row.original.lastUpdateDate
      if (!date) {
        return h('div', { class: 'text-muted' }, 'Never')
      }
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'text-sm' }, formatDate(date)),
        h('span', { class: 'text-xs text-muted' }, formatRelativeDate(date))
      ])
    }
  },
  {
    accessorKey: 'taskList',
    header: 'Task Details',
    cell: ({ row }) => {
      const tasks = row.original.taskList
      if (!tasks || tasks.length === 0) {
        return h('div', { class: 'text-muted text-sm' }, 'No tasks')
      }
      return h('div', { class: 'flex flex-col gap-1' }, 
        tasks.slice(0, 3).map((task: any) => 
          h('div', { class: 'text-sm' }, [
            h('span', { class: 'font-medium' }, task.title || task.name || 'Untitled'),
            task.due_date ? h('span', { class: 'text-muted ml-2' }, `Due: ${formatDate(task.due_date)}`) : null
          ])
        ).concat(
          tasks.length > 3 ? [h('span', { class: 'text-xs text-muted' }, `+${tasks.length - 3} more`)] : []
        )
      )
    }
  }
]
</script>

<template>
  <UDashboardPanel id="tasks-by-date">
    <template #header>
      <UDashboardNavbar title="Tasks Not Updated By Date Range">
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
          <ReportsDateRangeFilter
            :model-value="{
              start: queryStore.filters.startDate || sub(new Date(), { days: 7 }),
              end: queryStore.filters.endDate || new Date()
            }"
            @update:model-value="updateDateRange"
          />
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
        title="No tasks found"
        description="All tasks have been updated in the selected date range."
        icon="i-lucide-check-circle-2"
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
              <div class="p-2 bg-warning/10 rounded-lg">
                <UIcon name="i-lucide-clock" class="size-5 text-warning" />
              </div>
              <div>
                <p class="text-sm text-muted">Not Updated</p>
                <p class="text-2xl font-semibold text-warning">{{ summaryMetrics.totalTasksNotUpdated }}</p>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-error/10 rounded-lg">
                <UIcon name="i-lucide-user-x" class="size-5 text-error" />
              </div>
              <div>
                <p class="text-sm text-muted">With Issues</p>
                <p class="text-2xl font-semibold">{{ summaryMetrics.employeesWithIssues }}</p>
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
                text: (result.tasks?.length || 0).toString(),
                color: (result.tasks?.length || 0) > 0 ? 'warning' : 'success',
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

