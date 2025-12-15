import { defineStore } from 'pinia'

export const useApiStore = defineStore('api', {
  state: () => ({
    apiKey: '' as string,
    isTestingConnection: false as boolean,
    connectionError: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.apiKey
  },

  actions: {
    setApiKey(key: string) {
      this.apiKey = key
      if (typeof window !== 'undefined') {
        localStorage.setItem('gameplan_api_key', key)
      }
    },

    loadApiKey() {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('gameplan_api_key')
        if (stored) {
          this.apiKey = stored
        }
      }
    },

    clearApiKey() {
      this.apiKey = ''
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gameplan_api_key')
      }
      this.connectionError = null
    },

    async testConnection() {
      if (!this.apiKey) {
        this.connectionError = 'API key is required'
        return false
      }

      this.isTestingConnection = true
      this.connectionError = null

      try {
        // Test with a simple API call (goes through server proxy which adds auth)
        const response = await $fetch('/api/gameplan/GP Team?limit_page_length=1', {
          headers: {
            'X-API-Key': this.apiKey
          }
        })

        this.isTestingConnection = false
        return true
      } catch (error: any) {
        this.isTestingConnection = false
        const errorMessage = error.data?.message || error.statusMessage || error.message || 'Connection failed'
        this.connectionError = errorMessage
        console.error('Connection test failed:', error)
        return false
      }
    }
  }
})

