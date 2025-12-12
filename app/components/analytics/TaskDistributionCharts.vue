<script setup lang="ts">
import type { GPTask } from '~/types/gameplan'
import { VisXYContainer, VisPie, VisAxis, VisBar, VisTooltip } from '@unovis/vue'

const props = defineProps<{
  tasks: GPTask[]
}>()

const statusCardRef = useTemplateRef<HTMLElement | null>('statusCardRef')
const priorityCardRef = useTemplateRef<HTMLElement | null>('priorityCardRef')
const { width: statusWidth } = useElementSize(statusCardRef)
const { width: priorityWidth } = useElementSize(priorityCardRef)

// Tasks by status
const tasksByStatus = computed(() => {
  const grouped: Record<string, number> = {}
  props.tasks.forEach(task => {
    const status = task.status || 'Unknown'
    grouped[status] = (grouped[status] || 0) + 1
  })
  return Object.entries(grouped).map(([label, value]) => ({ label, value }))
})

// Tasks by priority
const tasksByPriority = computed(() => {
  const grouped: Record<string, number> = {}
  props.tasks.forEach(task => {
    const priority = task.priority || 'Unknown'
    grouped[priority] = (grouped[priority] || 0) + 1
  })
  return Object.entries(grouped).map(([label, value]) => ({ label, value }))
})

const pieColors = ['var(--ui-primary)', 'var(--ui-success)', 'var(--ui-warning)', 'var(--ui-error)', 'var(--ui-neutral)']
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Tasks by Status</h3>
      </template>
      <div ref="statusCardRef" class="h-80">
        <VisXYContainer
          v-if="tasksByStatus.length > 0 && statusWidth > 0"
          :data="tasksByStatus"
          :width="statusWidth"
          :height="320"
        >
          <VisPie
            :value="(d) => d.value"
            :label="(d) => d.label"
            :colors="pieColors"
          />
          <VisTooltip />
        </VisXYContainer>
        <div v-else class="flex items-center justify-center h-full text-muted">
          <div class="text-center">
            <UIcon name="i-lucide-pie-chart" class="size-12 mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Tasks by Priority</h3>
      </template>
      <div ref="priorityCardRef" class="h-80">
        <VisXYContainer
          v-if="tasksByPriority.length > 0 && priorityWidth > 0"
          :data="tasksByPriority"
          :width="priorityWidth"
          :height="320"
          :padding="{ top: 20, bottom: 40, left: 40, right: 20 }"
        >
          <VisBar
            :x="(d, i) => i"
            :y="(d) => d.value"
            color="var(--ui-primary)"
          />
          <VisAxis
            type="x"
            :x="(d, i) => i"
            :tick-format="(i: number) => tasksByPriority[i]?.label || ''"
          />
          <VisAxis
            type="y"
            :y="(d) => d.value"
          />
          <VisTooltip />
        </VisXYContainer>
        <div v-else class="flex items-center justify-center h-full text-muted">
          <div class="text-center">
            <UIcon name="i-lucide-bar-chart-3" class="size-12 mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
.unovis-xy-container {
  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);
  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>

