import type { GPTask } from '~/types/gameplan'
import type { QueryFilters } from '~/types/query'

export function applyFilters<T extends { project?: string }>(
  data: T[],
  filters?: QueryFilters
): T[] {
  if (!filters) return data

  let filtered = data

  if (filters.project) {
    filtered = filtered.filter(item => item.project === filters.project)
  }

  // Add more filter logic as needed
  return filtered
}

export function groupByEmployee(tasks: GPTask[]): Record<string, GPTask[]> {
  const grouped: Record<string, GPTask[]> = {}

  tasks.forEach(task => {
    if (task.assigned_to) {
      if (!grouped[task.assigned_to]) {
        grouped[task.assigned_to] = []
      }
      grouped[task.assigned_to].push(task)
    }
  })

  return grouped
}

export function sortByCount<T extends Record<string, any>>(
  list: T[],
  key: keyof T
): T[] {
  return [...list].sort((a, b) => {
    const aValue = Number(a[key]) || 0
    const bValue = Number(b[key]) || 0
    return bValue - aValue
  })
}

export function filterByTeam<T extends { project?: string }>(
  items: T[],
  team: string,
  projects: Array<{ name: string; team?: string }>
): T[] {
  const teamProjects = projects.filter(p => p.team === team).map(p => p.name)
  return items.filter(item => item.project && teamProjects.includes(item.project))
}

export function filterByProject<T extends { project?: string }>(
  items: T[],
  project: string
): T[] {
  return items.filter(item => item.project === project)
}

