<script setup lang="ts">
import { QueryType } from '~/types/query'
import { useEmployeeQueries } from '~/composables/useEmployeeQueries'
import { useQueryStore } from '~/stores/query'
import { sub } from 'date-fns'

const queryStore = useQueryStore()

// Set default date range (last 7 days)
if (!queryStore.filters.startDate || !queryStore.filters.endDate) {
  queryStore.setFilters({
    startDate: sub(new Date(), { days: 7 }),
    endDate: new Date()
  })
}

const { results, loading, error, refetch } = useEmployeeQueries(QueryType.TASKS_BY_DATE)

function updateDateRange(range: { start: Date; end: Date }) {
  queryStore.setFilters({
    startDate: range.start,
    endDate: range.end
  })
}
</script>

<template>
  <UDashboardPanel id="tasks-by-date">
    <template #header>
      <UDashboardNavbar title="Tasks Not Updated By Date Range">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            :loading="loading"
            @click="refetch"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <ReportsDateRangeFilter
            :model-value="{
              start: queryStore.filters.startDate || sub(new Date(), { days: 7 }),
              end: queryStore.filters.endDate || new Date()
            }"
            @update:model-value="updateDateRange"
          />
          <ReportsReportFilters
            :show-team-filter="true"
            :show-project-filter="true"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <CommonErrorDebugPanel
        v-if="error"
        :error="error"
      />

      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>

      <CommonEmptyDataState
        v-else-if="!loading && results.length === 0"
        title="No tasks found"
        description="All tasks have been updated in the selected date range."
        icon="i-lucide-check-circle-2"
      />

      <div v-else class="space-y-4">
        <ReportsEmployeeCard
          v-for="(result, index) in results"
          :key="index"
          :employee="result"
          :show-tasks="true"
          :show-metrics="true"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

