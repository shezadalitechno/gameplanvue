<script setup lang="ts">
import type { PerformanceMetrics } from '~/types/performance'

const props = defineProps<{
  metrics: PerformanceMetrics[]
}>()

const topPerformers = computed(() => {
  if (!props.metrics || props.metrics.length === 0) return []
  return props.metrics
    .filter(m => {
      // Only include valid metrics with proper employee email and rank
      return m && 
             m.employee && 
             m.employee.email && 
             typeof m.employee.email === 'string' && 
             m.employee.email.trim() !== '' &&
             m.rank !== undefined && 
             m.rank !== null && 
             typeof m.rank === 'number' && 
             m.rank > 0
    })
    .slice(0, 10)
})

const bottomPerformers = computed(() => {
  if (!props.metrics || props.metrics.length === 0) return []
  return [...props.metrics]
    .filter(m => {
      // Only include valid metrics with proper employee email and rank
      return m && 
             m.employee && 
             m.employee.email && 
             typeof m.employee.email === 'string' && 
             m.employee.email.trim() !== '' &&
             m.rank !== undefined && 
             m.rank !== null && 
             typeof m.rank === 'number' && 
             m.rank > 0
    })
    .reverse()
    .slice(0, 10)
})
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
        v-if="topPerformers.length > 0"
        :data="topPerformers"
        :columns="[
          { accessorKey: 'rank', header: 'Rank', cell: ({ row }) => row.rank ? `#${row.rank}` : 'N/A' },
          { accessorKey: 'employee.email', header: 'Employee', cell: ({ row }) => row.employee?.name || row.employee?.full_name || row.employee?.email || 'Unknown' },
          { accessorKey: 'score', header: 'Score', cell: ({ row }) => (row.score ?? 0).toFixed(1) },
          { accessorKey: 'tasksCompleted', header: 'Completed' }
        ]"
        :ui="{
          th: 'font-semibold',
          td: 'py-3'
        }"
      />
      <div v-else class="text-center py-8 text-muted">
        <p>No performance data available</p>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trending-down" class="size-5 text-error" />
          <h3 class="text-lg font-semibold">Needs Improvement</h3>
        </div>
      </template>
      <UTable
        v-if="bottomPerformers.length > 0"
        :data="bottomPerformers"
        :columns="[
          { accessorKey: 'rank', header: 'Rank', cell: ({ row }) => row.rank ? `#${row.rank}` : 'N/A' },
          { accessorKey: 'employee.email', header: 'Employee', cell: ({ row }) => row.employee?.name || row.employee?.full_name || row.employee?.email || 'Unknown' },
          { accessorKey: 'score', header: 'Score', cell: ({ row }) => (row.score ?? 0).toFixed(1) },
          { accessorKey: 'tasksCompleted', header: 'Completed' }
        ]"
        :ui="{
          th: 'font-semibold',
          td: 'py-3'
        }"
      />
      <div v-else class="text-center py-8 text-muted">
        <p>No performance data available</p>
      </div>
    </UCard>
  </div>
</template>

