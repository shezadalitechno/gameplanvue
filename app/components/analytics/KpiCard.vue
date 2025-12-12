<script setup lang="ts">
const props = defineProps<{
  title: string
  value: string | number
  icon?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
  trend?: number
  subtitle?: string
  to?: string
}>()

const colorClass = computed(() => {
  const color = props.color || 'primary'
  return {
    primary: 'bg-primary/10 ring-primary/25 text-primary',
    success: 'bg-success/10 ring-success/25 text-success',
    warning: 'bg-warning/10 ring-warning/25 text-warning',
    error: 'bg-error/10 ring-error/25 text-error',
    neutral: 'bg-neutral/10 ring-neutral/25 text-neutral'
  }[color]
})
</script>

<template>
  <UCard
    :to="to"
    class="hover:shadow-lg transition-shadow cursor-pointer"
    :ui="{ body: 'p-6' }"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-xs font-medium text-muted uppercase mb-2">
          {{ title }}
        </p>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-highlighted">
            {{ value }}
          </span>
          <UBadge
            v-if="trend !== undefined"
            :color="trend > 0 ? 'success' : 'error'"
            variant="subtle"
            size="xs"
          >
            {{ trend > 0 ? '+' : '' }}{{ trend }}%
          </UBadge>
        </div>
        <p v-if="subtitle" class="text-sm text-muted mt-2">
          {{ subtitle }}
        </p>
      </div>
      <div
        v-if="icon"
        :class="['p-3 rounded-lg', colorClass]"
      >
        <UIcon :name="icon" class="size-6" />
      </div>
    </div>
  </UCard>
</template>

