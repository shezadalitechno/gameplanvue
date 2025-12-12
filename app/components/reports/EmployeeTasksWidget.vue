<script setup lang="ts">
import type { EmployeeQueryResult } from '~/types/query'

const props = defineProps<{
  employee: EmployeeQueryResult
}>()

const taskCount = computed(() => {
  return props.employee.tasks?.length || 0
})

const employeeName = computed(() => {
  return props.employee.employee.name || 
         props.employee.employee.full_name || 
         props.employee.employee.email
})
</script>

<template>
  <UCard>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UAvatar
          :alt="employeeName"
          size="md"
        />
        <div>
          <p class="font-medium text-highlighted">
            {{ employeeName }}
          </p>
        </div>
      </div>

      <UBadge
        :label="`${taskCount} task${taskCount !== 1 ? 's' : ''}`"
        variant="subtle"
        color="warning"
      />
    </div>
  </UCard>
</template>
