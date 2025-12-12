import { defineStore } from 'pinia'
import type { GPTask, GPComment, GPActivity, GPProject, GPTeam } from '~/types/gameplan'

export const useDataCacheStore = defineStore('dataCache', {
  state: () => ({
    tasks: [] as GPTask[],
    comments: [] as GPComment[],
    activities: [] as GPActivity[],
    projects: [] as GPProject[],
    teams: [] as GPTeam[],
    lastFetchTime: null as Date | null,
    cacheExpiryMinutes: 5 as number
  }),

  getters: {
    isStale(): boolean {
      if (!this.lastFetchTime) return true
      const now = new Date()
      const diffMs = now.getTime() - this.lastFetchTime.getTime()
      const diffMinutes = diffMs / (1000 * 60)
      return diffMinutes > this.cacheExpiryMinutes
    }
  },

  actions: {
    setTasks(tasks: GPTask[]) {
      this.tasks = tasks
      this.lastFetchTime = new Date()
    },

    setComments(comments: GPComment[]) {
      this.comments = comments
      this.lastFetchTime = new Date()
    },

    setActivities(activities: GPActivity[]) {
      this.activities = activities
      this.lastFetchTime = new Date()
    },

    setProjects(projects: GPProject[]) {
      this.projects = projects
      this.lastFetchTime = new Date()
    },

    setTeams(teams: GPTeam[]) {
      this.teams = teams
      this.lastFetchTime = new Date()
    },

    clearCache() {
      this.tasks = []
      this.comments = []
      this.activities = []
      this.projects = []
      this.teams = []
      this.lastFetchTime = null
    },

    setCacheExpiry(minutes: number) {
      this.cacheExpiryMinutes = minutes
    }
  }
})

