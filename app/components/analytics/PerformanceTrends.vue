<script setup lang="ts">
import type { TrendData } from '~/types/performance'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'

const props = defineProps<{
  trends: TrendData[]
}>()

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')
const { width } = useElementSize(cardRef)

const x = (_: TrendData, i: number) => i
const y = (d: TrendData) => d.value

const formatNumber = (value: number) => value.toString()
const formatDate = (d: TrendData) => d.label || d.date.toLocaleDateString()
const template = (d: TrendData) => `${formatDate(d)}: ${formatNumber(d.value)}`
</script>

<template>
  <UCard ref="cardRef" :ui="{ root: 'overflow-visible', body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div>
        <p class="text-xs text-muted uppercase mb-1.5">Performance Trends</p>
        <p class="text-3xl text-highlighted font-semibold">
          {{ trends.length }} days
        </p>
      </div>
    </template>

    <VisXYContainer
      v-if="trends.length > 0 && width > 0"
      :data="trends"
      :padding="{ top: 40, bottom: 40, left: 60, right: 20 }"
      class="h-96"
      :width="width"
    >
      <VisLine
        :x="x"
        :y="y"
        color="var(--ui-primary)"
        :stroke-width="2"
      />
      <VisArea
        :x="x"
        :y="y"
        color="var(--ui-primary)"
        :opacity="0.1"
      />
      <VisAxis
        type="x"
        :x="x"
        :tick-format="(i: number) => {
          const trend = trends[i]
          if (!trend) return ''
          const date = new Date(trend.date)
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }"
      />
      <VisAxis
        type="y"
        :y="y"
      />
      <VisCrosshair
        color="var(--ui-primary)"
        :template="template"
      />
      <VisTooltip />
    </VisXYContainer>
    <div v-else class="flex items-center justify-center h-96 text-muted">
      <div class="text-center">
        <UIcon name="i-lucide-trending-up" class="size-12 mb-2 opacity-50" />
        <p>No trend data available</p>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);
  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);
  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>

