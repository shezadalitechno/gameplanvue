import type { GPTask, GPComment, GPActivity, GPProject, GPTeam, GPUserProfile } from '~/types/gameplan'
import { useApiStore } from '~/stores/api'
import { createUserFriendlyError, isApiKeyError, createSerializableError } from '../utils/errorUtils'

export async function apiCall<T>(doctype: string, options?: {
  fields?: string[]
  filters?: Record<string, any>
  limit_start?: number
  limit_page_length?: number
}): Promise<T[]> {
  // Get API key from store
  const apiStore = useApiStore()
  if (typeof window !== 'undefined') {
    apiStore.loadApiKey()
  }
  
  const apiKey = apiStore.apiKey

  if (!apiKey) {
    throw createSerializableError('API key is required. Please configure it in settings.', 401)
  }

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
      if (value !== undefined && value !== null) {
        params[key] = typeof value === 'object' ? JSON.stringify(value) : String(value)
      }
    })
  }

  const queryString = new URLSearchParams(params).toString()
  // URL encode the doctype name to handle spaces and special characters
  const encodedDoctype = encodeURIComponent(doctype)
  const url = `/api/gameplan/${encodedDoctype}${queryString ? `?${queryString}` : ''}`

  try {
    const response = await $fetch<any>(url, {
      headers: {
        'X-API-Key': apiKey
      }
    })

    // Handle different response formats from GamePlan API
    if (Array.isArray(response)) {
      return response as T[]
    }

    // Handle wrapped response with 'data' property
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data
      if (Array.isArray(data)) {
        return data as T[]
      }
      // If data is a single object, wrap it in an array
      if (data && typeof data === 'object') {
        return [data] as T[]
      }
    }

    // Handle single object response (wrap in array)
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      return [response] as T[]
    }

    // Empty response
    return []
  } catch (error: any) {
    console.error(`API call failed for ${doctype}:`, {
      error,
      message: error.message,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: error.data
    })
    
    // Throw user-friendly error
    throw createUserFriendlyError(error)
  }
}

export async function getAllWithPagination<T>(
  doctype: string,
  fields?: string[],
  pageSize: number = 1000
): Promise<T[]> {
  // Check API key before starting pagination
  const apiStore = useApiStore()
  if (typeof window !== 'undefined') {
    apiStore.loadApiKey()
  }
  
  if (!apiStore.apiKey) {
    throw new Error('API key is required. Please configure it in settings.')
  }

  const allResults: T[] = []
  let limitStart = 0
  let hasMore = true
  let consecutiveErrors = 0
  const maxConsecutiveErrors = 3

  while (hasMore) {
    try {
      const results = await apiCall<T>(doctype, {
        fields: fields || ['*'],
        limit_start: limitStart,
        limit_page_length: pageSize
      })

      // Reset error counter on success
      consecutiveErrors = 0

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
    } catch (error: any) {
      consecutiveErrors++
      console.error(`Pagination error for ${doctype} at offset ${limitStart}:`, error)
      
      // If it's an API key error, throw immediately (as plain object)
      if (error?.message?.includes('API key') || error?.statusCode === 401) {
        throw createUserFriendlyError(error)
      }
      
      // For other errors, log and stop pagination
      console.warn(`Non-critical pagination error, stopping pagination`)
      
      // If we've had too many consecutive errors, stop pagination
      if (consecutiveErrors >= maxConsecutiveErrors) {
        console.warn(`Stopping pagination after ${maxConsecutiveErrors} consecutive errors`)
        hasMore = false
      } else {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
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

