<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { QueryType } from '~/types/query'
import type { TableColumn } from '@nuxt/ui'
import { useEmployeeQueries } from '~/composables/useEmployeeQueries'
import { formatDate } from '~/composables/utils/formatters'

const { results, loading, error, refetch } = useEmployeeQueries(QueryType.BACKLOG)

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

// Transform data for table
const tableData = computed(() => {
  return results.value.map((result) => ({
    employeeName: result.employee.name || result.employee.full_name || result.employee.email,
    employeeEmail: result.employee.email,
    totalTasks: result.taskCount || 0,
    overdueTasks: result.backlogCount || result.metrics?.overdueTasks || 0,
    taskList: result.tasks || []
  }))
})

// Summary metrics
const summaryMetrics = computed(() => {
  const totalEmployees = results.value.length
  const totalOverdue = results.value.reduce((sum, r) => sum + (r.backlogCount || r.metrics?.overdueTasks || 0), 0)
  const totalTasks = results.value.reduce((sum, r) => sum + (r.taskCount || 0), 0)
  const employeesWithBacklog = results.value.filter(r => (r.backlogCount || 0) > 0).length
  
  return {
    totalEmployees,
    totalOverdue,
    totalTasks,
    employeesWithBacklog
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
    accessorKey: 'overdueTasks',
    header: 'Overdue Tasks',
    cell: ({ row }) => {
      const count = row.original.overdueTasks
      if (count === 0) return h('div', { class: 'text-center text-muted' }, '0')
      return h('div', { class: 'text-center' }, h(UBadge, {
        label: count.toString(),
        variant: 'subtle',
        color: 'error',
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
  <UDashboardPanel id="backlog">
    <template #header>
      <UDashboardNavbar title="Employees With Backlog">
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
        title="No backlog tasks"
        description="Great! No employees have overdue tasks."
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
              <div class="p-2 bg-error/10 rounded-lg">
                <UIcon name="i-lucide-alert-circle" class="size-5 text-error" />
              </div>
              <div>
                <p class="text-sm text-muted">Overdue Tasks</p>
                <p class="text-2xl font-semibold text-error">{{ summaryMetrics.totalOverdue }}</p>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-warning/10 rounded-lg">
                <UIcon name="i-lucide-user-x" class="size-5 text-warning" />
              </div>
              <div>
                <p class="text-sm text-muted">With Backlog</p>
                <p class="text-2xl font-semibold">{{ summaryMetrics.employeesWithBacklog }}</p>
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
                text: (result.backlogCount || 0).toString(),
                color: (result.backlogCount || 0) > 0 ? 'error' : 'success',
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

