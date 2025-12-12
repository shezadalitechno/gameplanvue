import { defineStore } from 'pinia'
import type { GPUserProfile } from '~/types/gameplan'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: {} as Record<string, GPUserProfile>
  }),

  actions: {
    setEmployees(employees: GPUserProfile[]) {
      employees.forEach(emp => {
        if (emp.email || emp.name) {
          const key = emp.email || emp.name
          if (key) {
            this.employees[key] = emp
          }
        }
      })
    },

    getEmployee(email: string): GPUserProfile | undefined {
      return this.employees[email]
    },

    clearCache() {
      this.employees = {}
    }
  }
})

