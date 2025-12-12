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
  <UCard class="p-3">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <UAvatar
          :alt="employeeName"
          size="sm"
        />
        <p class="font-medium text-sm text-highlighted truncate">
          {{ employeeName }}
        </p>
      </div>

      <UBadge
        :label="taskCount"
        variant="subtle"
        color="warning"
        size="sm"
      />
    </div>
  </UCard>
</template>
