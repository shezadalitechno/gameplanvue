<script setup lang="ts">
import type { TeamMetrics } from '~/types/performance'

const props = defineProps<{
  teams: TeamMetrics[]
}>()

const columns = [
  { accessorKey: 'teamTitle', header: 'Team' },
  { accessorKey: 'totalEmployees', header: 'Employees' },
  { accessorKey: 'totalTasks', header: 'Total Tasks' },
  { accessorKey: 'completedTasks', header: 'Completed' },
  { accessorKey: 'overdueTasks', header: 'Overdue' },
  {
    accessorKey: 'averageCompletionRate',
    header: 'Completion Rate',
    cell: ({ row }: any) => `${(row.averageCompletionRate ?? 0).toFixed(1)}%`
  }
]
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-users-2" class="size-5 text-primary" />
        <h3 class="text-lg font-semibold">Team Overview</h3>
      </div>
    </template>
    <UTable
      :data="teams"
      :columns="columns"
      :ui="{
        th: 'font-semibold',
        td: 'py-3'
      }"
    />
  </UCard>
</template>

