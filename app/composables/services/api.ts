import type { GPTask, GPComment, GPActivity, GPProject, GPTeam, GPUserProfile } from '~/types/gameplan'

export async function apiCall<T>(doctype: string, options?: {
  fields?: string[]
  filters?: Record<string, any>
  limit_start?: number
  limit_page_length?: number
}): Promise<T[]> {
  const params: Record<string, string> = {}

  if (options?.fields) {
    params.fields = JSON.stringify(options.fields)
  }

  if (options?.limit_start !== undefined) {
    params.limit_start = String(options.limit_start)
  }

  if (options?.limit_page_length !== undefined) {
    params.limit_page_length = String(options.limit_page_length)
  }

  // Build filters query string if provided
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      params[key] = String(value)
    })
  }

  const queryString = new URLSearchParams(params).toString()
  const url = `/api/gameplan/${doctype}${queryString ? `?${queryString}` : ''}`

  try {
    const response = await $fetch<any>(url)

    // Handle different response formats
    if (Array.isArray(response)) {
      return response as T[]
    }

    if (response && typeof response === 'object' && 'data' in response) {
      return (response.data as T[]) || []
    }

    return []
  } catch (error) {
    console.error(`API call failed for ${doctype}:`, error)
    throw error
  }
}

export async function getAllWithPagination<T>(
  doctype: string,
  fields?: string[],
  pageSize: number = 1000
): Promise<T[]> {
  const allResults: T[] = []
  let limitStart = 0
  let hasMore = true

  while (hasMore) {
    try {
      const results = await apiCall<T>(doctype, {
        fields: fields || ['*'],
        limit_start: limitStart,
        limit_page_length: pageSize
      })

      if (results.length === 0) {
        hasMore = false
      } else {
        allResults.push(...results)
        limitStart += pageSize

        // If we got fewer results than pageSize, we've reached the end
        if (results.length < pageSize) {
          hasMore = false
        }
      }
    } catch (error) {
      console.error(`Pagination error for ${doctype} at offset ${limitStart}:`, error)
      hasMore = false
    }
  }

  return allResults
}

export async function getWithFields<T>(doctype: string, fields: string[]): Promise<T[]> {
  return apiCall<T>(doctype, { fields })
}

export async function getWithFilters<T>(
  doctype: string,
  filters: Record<string, any>,
  fields?: string[]
): Promise<T[]> {
  return apiCall<T>(doctype, { filters, fields })
}

// Convenience functions for specific DocTypes
export async function getAllTasks(): Promise<GPTask[]> {
  return getAllWithPagination<GPTask>('GP Task')
}

export async function getAllComments(): Promise<GPComment[]> {
  return getAllWithPagination<GPComment>('GP Comment')
}

export async function getAllActivities(): Promise<GPActivity[]> {
  return getAllWithPagination<GPActivity>('GP Activity')
}

export async function getAllProjects(): Promise<GPProject[]> {
  return getAllWithPagination<GPProject>('GP Project')
}

export async function getAllTeams(): Promise<GPTeam[]> {
  return getAllWithPagination<GPTeam>('GP Team')
}

export async function getAllUserProfiles(): Promise<GPUserProfile[]> {
  return getAllWithPagination<GPUserProfile>('GP User Profile')
}

