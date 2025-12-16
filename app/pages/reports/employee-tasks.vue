<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { QueryType } from '~/types/query'
import type { TableColumn } from '@nuxt/ui'
import { useEmployeeQueries } from '~/composables/useEmployeeQueries'
import { formatDate } from '~/composables/utils/formatters'
import type { GPTask } from '~/types/gameplan'
import type { EmployeeQueryResult } from '~/types/query'
import { useDataCacheStore } from '~/stores/dataCache'

const { results, loading, error, refetch } = useEmployeeQueries(QueryType.EMPLOYEE_TASKS)
const dataCacheStore = useDataCacheStore()

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

// Selected employee state
const selectedEmployeeEmail = ref<string | null>(null)

// Employee options for dropdown
const employeeOptions = computed(() => {
  return results.value.map((result) => ({
    label: result.employee.name || result.employee.full_name || result.employee.email,
    value: result.employee.email,
    avatar: {
      alt: result.employee.name || result.employee.full_name || result.employee.email
    }
  }))
})

// Filtered results based on selected employee
const filteredResults = computed(() => {
  if (!selectedEmployeeEmail.value) {
    return results.value
  }
  return results.value.filter(result => result.employee.email === selectedEmployeeEmail.value)
})

// Selected employee data
const selectedEmployeeData = computed(() => {
  if (!selectedEmployeeEmail.value) {
    return null
  }
  return results.value.find(result => result.employee.email === selectedEmployeeEmail.value) || null
})

// Transform data for table
const tableData = computed(() => {
  return filteredResults.value.map((result) => ({
    employeeName: result.employee.name || result.employee.full_name || result.employee.email,
    employeeEmail: result.employee.email,
    taskCount: result.taskCount || 0,
    taskList: result.tasks || []
  }))
})

// Calculate done tasks count - for selected employee or all employees
const doneTasksCount = computed(() => {
  const allTasks = dataCacheStore.tasks
  let tasksToCheck = allTasks
  
  // If an employee is selected, filter by that employee's email
  if (selectedEmployeeEmail.value) {
    tasksToCheck = allTasks.filter(task => task.assigned_to === selectedEmployeeEmail.value)
  }
  
  return tasksToCheck.filter(task => {
    const status = task.status?.toLowerCase() || ''
    return status === 'done' || status === 'completed' || status === 'closed'
  }).length
})

// Summary metrics (based on filtered results)
const summaryMetrics = computed(() => {
  const dataToUse = selectedEmployeeData.value ? [selectedEmployeeData.value] : filteredResults.value
  const totalEmployees = dataToUse.length
  const totalTasks = dataToUse.reduce((sum, r) => sum + (r.taskCount || 0), 0)
  const inProgressTasks = dataToUse.reduce((sum, r) => sum + (r.metrics?.inProgressTasks || 0), 0)
  
  return {
    totalEmployees,
    totalTasks,
    inProgressTasks,
    doneTasks: doneTasksCount.value
  }
})

// Function to select employee
function selectEmployee(email: string | null) {
  selectedEmployeeEmail.value = email
}

// Function to clear selection
function clearSelection() {
  selectedEmployeeEmail.value = null
}

// Helper function to get status color
function getStatusColor(status?: string): string {
  if (!status) return 'neutral'
  const statusLower = status.toLowerCase()
  if (statusLower === 'completed' || statusLower === 'closed') return 'success'
  if (statusLower === 'in progress' || statusLower === 'open') return 'primary'
  if (statusLower === 'blocked' || statusLower === 'cancelled') return 'error'
  return 'warning'
}

// Helper function to get priority color
function getPriorityColor(priority?: string): string {
  if (!priority) return 'neutral'
  const priorityLower = priority.toLowerCase()
  if (priorityLower === 'high' || priorityLower === 'urgent') return 'error'
  if (priorityLower === 'medium' || priorityLower === 'normal') return 'warning'
  return 'success'
}

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
    accessorKey: 'taskCount',
    header: 'Active Tasks',
    cell: ({ row }) => {
      const count = row.original.taskCount
      if (count === 0) return h('div', { class: 'text-center text-muted' }, '0')
      return h('div', { class: 'text-center' }, h(UBadge, {
        label: count.toString(),
        variant: 'subtle',
        color: 'primary',
        size: 'sm'
      }))
    }
  },
  {
    accessorKey: 'taskList',
    header: 'Task Details',
    cell: ({ row }) => {
      const tasks = row.original.taskList as GPTask[]
      if (!tasks || tasks.length === 0) {
        return h('div', { class: 'text-muted text-sm' }, 'No active tasks')
      }
      return h('div', { class: 'flex flex-col gap-2 max-w-2xl' }, 
        tasks.map((task: GPTask) => 
          h('div', { class: 'flex flex-col gap-1 p-2 bg-muted/30 rounded border border-border' }, [
            h('div', { class: 'flex items-center gap-2 flex-wrap' }, [
              h('span', { class: 'font-medium text-sm' }, task.title || task.name || 'Untitled'),
              task.status ? h(UBadge, {
                label: task.status,
                variant: 'subtle',
                color: getStatusColor(task.status),
                size: 'xs'
              }) : null,
              task.priority ? h(UBadge, {
                label: task.priority,
                variant: 'subtle',
                color: getPriorityColor(task.priority),
                size: 'xs'
              }) : null
            ]),
            h('div', { class: 'flex items-center gap-3 text-xs text-muted' }, [
              task.due_date ? h('span', {}, `Due: ${formatDate(task.due_date)}`) : null,
              task.project ? h('span', {}, `Project: ${task.project}`) : null
            ])
          ])
        )
      )
    }
  }
]
</script>

<template>
  <UDashboardPanel id="employee-tasks">
    <template #header>
      <UDashboardNavbar title="Employee Tasks">
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
          <div class="flex flex-wrap items-center gap-3">
            <USelect
              :model-value="selectedEmployeeEmail"
              :items="employeeOptions"
              placeholder="Select employee to view tasks"
              class="min-w-64"
              @update:model-value="(value) => selectEmployee(value as string | null)"
            />
            <UButton
              v-if="selectedEmployeeEmail"
              label="Clear selection"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              @click="clearSelection"
            />
            <ReportsReportFilters
              :show-team-filter="true"
              :show-project-filter="true"
            />
          </div>
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
        title="No active tasks"
        description="All employees have completed their tasks or no tasks are assigned."
        icon="i-lucide-check-circle-2"
      />

      <CommonEmptyDataState
        v-else-if="!loading && selectedEmployeeEmail && filteredResults.length === 0"
        title="No tasks found"
        :description="`Selected employee has no active tasks.`"
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
              <div class="p-2 bg-primary/10 rounded-lg">
                <UIcon name="i-lucide-check-square" class="size-5 text-primary" />
              </div>
              <div>
                <p class="text-sm text-muted">Active Tasks</p>
                <p class="text-2xl font-semibold">{{ summaryMetrics.totalTasks }}</p>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-info/10 rounded-lg">
                <UIcon name="i-lucide-play-circle" class="size-5 text-info" />
              </div>
              <div>
                <p class="text-sm text-muted">In Progress</p>
                <p class="text-2xl font-semibold">{{ summaryMetrics.inProgressTasks }}</p>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-success/10 rounded-lg">
                <UIcon name="i-lucide-check-circle-2" class="size-5 text-success" />
              </div>
              <div>
                <p class="text-sm text-muted">Done Tasks</p>
                <p class="text-2xl font-semibold">{{ summaryMetrics.doneTasks }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Employee Summary Widget -->
        <UCard v-if="!selectedEmployeeEmail">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <UUser
              v-for="(result, index) in results"
              :key="index"
              :name="result.employee.name || result.employee.full_name || result.employee.email"
              :avatar="{
                alt: result.employee.name || result.employee.full_name || result.employee.email
              }"
              :chip="{
                text: (result.taskCount || 0).toString(),
                color: (result.taskCount || 0) > 0 ? 'primary' : 'neutral',
                position: 'top-right'
              }"
              size="sm"
              class="cursor-pointer hover:bg-muted/50 transition-colors"
              @click="selectEmployee(result.employee.email)"
            />
          </div>
        </UCard>

        <!-- Selected Employee Card -->
        <UCard v-if="selectedEmployeeEmail && selectedEmployeeData">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <UAvatar
                :alt="selectedEmployeeData.employee.name || selectedEmployeeData.employee.full_name || selectedEmployeeData.employee.email"
                size="lg"
              />
              <div>
                <h3 class="text-lg font-semibold">
                  {{ selectedEmployeeData.employee.name || selectedEmployeeData.employee.full_name || selectedEmployeeData.employee.email }}
                </h3>
                <p class="text-sm text-muted">{{ selectedEmployeeData.employee.email }}</p>
              </div>
            </div>
            <UButton
              label="View All Employees"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              @click="clearSelection"
            />
          </div>
        </UCard>

        <!-- Table (hidden when single employee selected, tasks shown in card below) -->
        <UTable
          v-if="!selectedEmployeeEmail || filteredResults.length > 1"
          :data="tableData"
          :columns="columns"
          class="flex-1"
        />

        <!-- Detailed Task List for Selected Employee -->
        <div v-if="selectedEmployeeEmail && selectedEmployeeData" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Active Tasks ({{ selectedEmployeeData.taskCount || 0 }})</h3>
          </div>
          <div v-if="!selectedEmployeeData.tasks || selectedEmployeeData.tasks.length === 0" class="text-center py-8 text-muted">
            <UIcon name="i-lucide-inbox" class="size-12 mx-auto mb-2 opacity-50" />
            <p>No active tasks</p>
          </div>
          <div v-else class="grid grid-cols-1 gap-3">
            <UCard
              v-for="(task, index) in selectedEmployeeData.tasks"
              :key="index"
              class="p-4"
            >
              <div class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <h4 class="font-semibold text-highlighted mb-1">
                      {{ task.title || task.name || 'Untitled Task' }}
                    </h4>
                    <p v-if="task.description" class="text-sm text-muted line-clamp-2">
                      {{ task.description }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <UBadge
                    v-if="task.status"
                    :label="task.status"
                    :color="getStatusColor(task.status)"
                    variant="subtle"
                    size="sm"
                  />
                  <UBadge
                    v-if="task.priority"
                    :label="task.priority"
                    :color="getPriorityColor(task.priority)"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                <div class="flex items-center gap-4 text-sm text-muted">
                  <span v-if="task.due_date" class="flex items-center gap-1">
                    <UIcon name="i-lucide-calendar" class="size-4" />
                    Due: {{ formatDate(task.due_date) }}
                  </span>
                  <span v-if="task.project" class="flex items-center gap-1">
                    <UIcon name="i-lucide-folder" class="size-4" />
                    {{ task.project }}
                  </span>
                  <span v-if="task.modified" class="flex items-center gap-1">
                    <UIcon name="i-lucide-clock" class="size-4" />
                    Modified: {{ formatDate(task.modified) }}
                  </span>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

