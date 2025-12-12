<script setup lang="ts">
import type { PerformanceMetrics } from '~/types/performance'

const props = defineProps<{
  metrics: PerformanceMetrics[]
}>()

const topPerformers = computed(() => props.metrics.slice(0, 10))
const bottomPerformers = computed(() => [...props.metrics].reverse().slice(0, 10))
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trophy" class="size-5 text-warning" />
          <h3 class="text-lg font-semibold">Top 10 Performers</h3>
        </div>
      </template>
      <UTable
        :data="topPerformers"
        :columns="[
          { accessorKey: 'rank', header: 'Rank', cell: ({ row }) => `#${row.rank}` },
          { accessorKey: 'employee.email', header: 'Employee', cell: ({ row }) => row.employee?.email || row.employee?.name || row.employee?.full_name || 'Unknown' },
          { accessorKey: 'score', header: 'Score', cell: ({ row }) => (row.score ?? 0).toFixed(1) },
          { accessorKey: 'tasksCompleted', header: 'Completed' }
        ]"
        :ui="{
          th: 'font-semibold',
          td: 'py-3'
        }"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trending-down" class="size-5 text-error" />
          <h3 class="text-lg font-semibold">Needs Improvement</h3>
        </div>
      </template>
      <UTable
        :data="bottomPerformers"
        :columns="[
          { accessorKey: 'rank', header: 'Rank', cell: ({ row }) => `#${row.rank}` },
          { accessorKey: 'employee.email', header: 'Employee', cell: ({ row }) => row.employee?.email || row.employee?.name || row.employee?.full_name || 'Unknown' },
          { accessorKey: 'score', header: 'Score', cell: ({ row }) => (row.score ?? 0).toFixed(1) },
          { accessorKey: 'tasksCompleted', header: 'Completed' }
        ]"
        :ui="{
          th: 'font-semibold',
          td: 'py-3'
        }"
      />
    </UCard>
  </div>
</template>

