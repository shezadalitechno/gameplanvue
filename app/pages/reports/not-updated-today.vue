<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { QueryType } from '~/types/query'
import type { TableColumn } from '@nuxt/ui'
import { useEmployeeQueries } from '~/composables/useEmployeeQueries'
import { formatDate, formatRelativeDate } from '~/composables/utils/formatters'

const { results, loading, error, refetch } = useEmployeeQueries(QueryType.NOT_COMMENTED_TODAY)

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

// Transform data for table
const tableData = computed(() => {
  return results.value.map((result) => ({
    employeeName: result.employee.name || result.employee.full_name || result.employee.email,
    employeeEmail: result.employee.email,
    totalTasks: result.taskCount || 0,
    tasksNotCommented: result.tasks?.length || 0,
    lastCommentDate: result.lastCommentDate,
    backlogCount: result.backlogCount || 0
  }))
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
    accessorKey: 'totalTasks',
    header: 'Total Tasks',
    cell: ({ row }) => {
      return h('div', { class: 'text-center' }, row.original.totalTasks.toString())
    }
  },
  {
    accessorKey: 'tasksNotCommented',
    header: 'Tasks Not Commented',
    cell: ({ row }) => {
      const count = row.original.tasksNotCommented
      return h('div', { class: 'text-center' }, h(UBadge, {
        label: count.toString(),
        variant: 'subtle',
        color: count > 0 ? 'warning' : 'success',
        size: 'sm'
      }))
    }
  },
  {
    accessorKey: 'backlogCount',
    header: 'Overdue Tasks',
    cell: ({ row }) => {
      const count = row.original.backlogCount
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
    accessorKey: 'lastCommentDate',
    header: 'Last Comment',
    cell: ({ row }) => {
      const date = row.original.lastCommentDate
      if (!date) {
        return h('div', { class: 'text-muted' }, 'Never')
      }
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'text-sm' }, formatDate(date)),
        h('span', { class: 'text-xs text-muted' }, formatRelativeDate(date))
      ])
    }
  }
]
</script>

<template>
  <UDashboardPanel id="not-updated-today">
    <template #header>
      <UDashboardNavbar title="Employees Not Commented Today">
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
        title="All employees commented today"
        description="Great! All employees have commented on their tasks today."
        icon="i-lucide-check-circle-2"
      />

      <div v-else class="space-y-4">
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

