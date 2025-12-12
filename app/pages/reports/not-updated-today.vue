<script setup lang="ts">
import { QueryType } from '~/types/query'
import { useEmployeeQueries } from '~/composables/useEmployeeQueries'

const { results, loading, error, refetch } = useEmployeeQueries(QueryType.NOT_COMMENTED_TODAY)
</script>

<template>
  <UDashboardPanel id="not-updated-today">
    <template #header>
      <UDashboardNavbar title="Employees Not Commented Today">
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
        title="All employees commented today"
        description="Great! All employees have commented on their tasks today."
        icon="i-lucide-check-circle-2"
      />

      <div v-else class="space-y-4">
        <ReportsEmployeeTasksWidget
          v-for="(result, index) in results"
          :key="index"
          :employee="result"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

