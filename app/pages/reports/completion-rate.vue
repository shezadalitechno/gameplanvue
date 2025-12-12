<script setup lang="ts">
import { QueryType } from '~/types/query'
import { useEmployeeQueries } from '~/composables/useEmployeeQueries'

const { results, loading, error, refetch } = useEmployeeQueries(QueryType.COMPLETION_RATE)
</script>

<template>
  <UDashboardPanel id="completion-rate">
    <template #header>
      <UDashboardNavbar title="Task Completion Rates">
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
        title="No data available"
        description="No task completion data found."
        icon="i-lucide-inbox"
      />

      <div v-else class="space-y-4">
        <ReportsEmployeeCard
          v-for="(result, index) in results"
          :key="index"
          :employee="result"
          :show-metrics="true"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

