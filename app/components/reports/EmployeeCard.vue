<script setup lang="ts">
import type { EmployeeQueryResult } from '~/types/query'
import { formatDate, formatPercentage } from '~/composables/utils/formatters'

const props = defineProps<{
  employee: EmployeeQueryResult
  showTasks?: boolean
  showMetrics?: boolean
}>()

const expanded = ref(false)
</script>

<template>
  <UCard>
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <UAvatar
          :alt="employee.employee.name || employee.employee.email"
          size="lg"
        />
        <div>
          <p class="font-medium text-highlighted">
            {{ employee.employee.name || employee.employee.full_name || employee.employee.email }}
          </p>
          <p class="text-sm text-muted">
            {{ employee.employee.email }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UBadge
          v-if="employee.taskCount !== undefined"
          :label="`${employee.taskCount} tasks`"
          variant="subtle"
        />
        <UBadge
          v-if="employee.backlogCount !== undefined"
          :label="`${employee.backlogCount} overdue`"
          color="error"
          variant="subtle"
        />
        <UBadge
          v-if="employee.completionRate !== undefined"
          :label="formatPercentage(employee.completionRate)"
          :color="employee.completionRate < 50 ? 'error' : employee.completionRate < 75 ? 'warning' : 'success'"
          variant="subtle"
        />
      </div>
    </div>

    <div v-if="showMetrics && employee.metrics" class="mt-4 grid grid-cols-3 gap-4">
      <div>
        <p class="text-xs text-muted">Total Tasks</p>
        <p class="text-lg font-semibold">{{ employee.metrics.totalTasks || 0 }}</p>
      </div>
      <div>
        <p class="text-xs text-muted">Completed</p>
        <p class="text-lg font-semibold">{{ employee.metrics.completedTasks || 0 }}</p>
      </div>
      <div>
        <p class="text-xs text-muted">Overdue</p>
        <p class="text-lg font-semibold text-error">{{ employee.metrics.overdueTasks || 0 }}</p>
      </div>
    </div>

    <div v-if="employee.lastUpdateDate" class="mt-2 text-sm text-muted">
      Last update: {{ formatDate(employee.lastUpdateDate) }}
    </div>

    <div v-if="employee.lastCommentDate" class="mt-2 text-sm text-muted">
      Last comment: {{ formatDate(employee.lastCommentDate) }}
    </div>

    <UButton
      v-if="showTasks && employee.tasks && employee.tasks.length > 0"
      :label="expanded ? 'Hide tasks' : `Show ${employee.tasks.length} tasks`"
      size="xs"
      color="neutral"
      variant="ghost"
      class="mt-3"
      @click="expanded = !expanded"
    />

    <div v-if="expanded && employee.tasks" class="mt-3 space-y-2">
      <div
        v-for="task in employee.tasks"
        :key="task.name"
        class="p-2 bg-elevated rounded"
      >
        <p class="font-medium">{{ task.title || task.name }}</p>
        <p class="text-sm text-muted">
          Due: {{ task.due_date ? formatDate(task.due_date) : 'No due date' }}
        </p>
      </div>
    </div>
  </UCard>
</template>

