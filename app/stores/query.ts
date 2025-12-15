import { defineStore } from 'pinia'
import type { QueryFilters, EmployeeQueryResult } from '~/types/query'
import { QueryType } from '~/types/query'

export const useQueryStore = defineStore('query', {
  state: () => ({
    filters: {
      team: undefined as string | undefined,
      project: undefined as string | undefined,
      startDate: undefined as Date | undefined,
      endDate: undefined as Date | undefined
    } as QueryFilters,
    results: [] as EmployeeQueryResult[],
    loading: false as boolean,
    error: null as Record<string, any> | null,
    lastQueryType: null as QueryType | null
  }),

  actions: {
    setFilters(filters: Partial<QueryFilters>) {
      this.filters = { ...this.filters, ...filters }
    },

    setResults(results: EmployeeQueryResult[]) {
      this.results = results
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: Record<string, any> | Error | null) {
      // Convert Error to plain object if needed
      if (error instanceof Error) {
        this.error = {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      } else {
        this.error = error
      }
    },

    clearResults() {
      this.results = []
      this.error = null
    },

    resetFilters() {
      this.filters = {
        team: undefined,
        project: undefined,
        startDate: undefined,
        endDate: undefined
      }
    },

    setLastQueryType(queryType: QueryType) {
      this.lastQueryType = queryType
    }
  }
})

