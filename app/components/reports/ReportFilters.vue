<script setup lang="ts">
import type { QueryFilters } from '~/types/query'
import { useDataCacheStore } from '~/stores/dataCache'
import { useQueryStore } from '~/stores/query'

const props = defineProps<{
  showTeamFilter?: boolean
  showProjectFilter?: boolean
}>()

const queryStore = useQueryStore()
const dataCacheStore = useDataCacheStore()

const teamOptions = computed(() => {
  return dataCacheStore.teams.map(team => ({
    label: team.title || team.name,
    value: team.name
  }))
})

const projectOptions = computed(() => {
  return dataCacheStore.projects.map(project => ({
    label: project.title || project.name,
    value: project.name
  }))
})

function updateFilters(updates: Partial<QueryFilters>) {
  queryStore.setFilters(updates)
}

function clearFilters() {
  queryStore.resetFilters()
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <USelect
      v-if="showTeamFilter"
      :model-value="queryStore.filters.team"
      :items="teamOptions"
      placeholder="Filter by team"
      class="min-w-48"
      @update:model-value="(value) => updateFilters({ team: value as string })"
    />

    <USelect
      v-if="showProjectFilter"
      :model-value="queryStore.filters.project"
      :items="projectOptions"
      placeholder="Filter by project"
      class="min-w-48"
      @update:model-value="(value) => updateFilters({ project: value as string })"
    />

    <UButton
      v-if="queryStore.filters.team || queryStore.filters.project"
      label="Clear filters"
      color="neutral"
      variant="ghost"
      icon="i-lucide-x"
      @click="clearFilters"
    />
  </div>
</template>

