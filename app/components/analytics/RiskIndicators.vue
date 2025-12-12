<script setup lang="ts">
import type { RiskIndicator } from '~/types/performance'

const props = defineProps<{
  indicators: RiskIndicator[]
}>()

const expanded = ref<Record<string, boolean>>({})

function toggleCategory(category: string) {
  expanded.value[category] = !expanded.value[category]
}

const categoryLabels: Record<string, string> = {
  overdue: 'Overdue Tasks',
  inactive: 'Inactive Employees',
  overloaded: 'Overloaded Employees',
  low_performers: 'Low Performers',
  burnout_risk: 'Burnout Risk'
}

const categoryColors: Record<string, string> = {
  overdue: 'error',
  inactive: 'warning',
  overloaded: 'warning',
  low_performers: 'error',
  burnout_risk: 'error'
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
    <UCard
      v-for="indicator in indicators"
      :key="indicator.category"
      :color="categoryColors[indicator.category]"
      variant="subtle"
      class="cursor-pointer hover:shadow-md transition-shadow"
      @click="toggleCategory(indicator.category)"
    >
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-semibold">{{ categoryLabels[indicator.category] }}</p>
          <UIcon
            :name="expanded[indicator.category] ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="size-4 text-muted"
          />
        </div>
        <p class="text-3xl font-bold mb-2">{{ indicator.count }}</p>
        <p class="text-xs text-muted">employees</p>
      </div>

      <div v-if="expanded[indicator.category] && indicator.employees.length > 0" class="mt-4 pt-4 border-t border-default space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="employee in indicator.employees"
          :key="employee.email || 'unknown'"
          class="p-2 bg-elevated rounded text-sm"
        >
          <p class="font-medium text-highlighted">{{ employee.name || employee.email || 'Unknown' }}</p>
          <p class="text-muted text-xs mt-1">{{ employee.reason }}</p>
          <UBadge
            :color="employee.severity === 'high' ? 'error' : employee.severity === 'medium' ? 'warning' : 'neutral'"
            variant="subtle"
            size="xs"
            class="mt-1"
          >
            {{ employee.severity }}
          </UBadge>
        </div>
      </div>
      <div v-else-if="expanded[indicator.category]" class="mt-4 pt-4 border-t border-default">
        <p class="text-sm text-muted">No employees in this category</p>
      </div>
    </UCard>
  </div>
</template>

