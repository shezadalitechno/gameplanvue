/**
 * Utility functions for handling and formatting errors
 */

export interface ApiError {
  message: string
  statusCode?: number
  statusMessage?: string
  data?: any
}

/**
 * Formats API errors into user-friendly messages
 */
export function formatApiError(error: any): string {
  if (!error) {
    return 'An unknown error occurred'
  }

  // Handle API key errors
  if (error.message?.includes('API key') || error.statusCode === 401) {
    return 'API key is required or invalid. Please configure your API key in settings.'
  }

  // Handle network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return 'Network error. Please check your internet connection and try again.'
  }

  // Handle timeout errors
  if (error.message?.includes('timeout') || error.statusCode === 504) {
    return 'Request timed out. The server may be slow or unavailable. Please try again.'
  }

  // Handle server errors
  if (error.statusCode >= 500) {
    return 'Server error. Please try again later or contact support if the problem persists.'
  }

  // Handle not found errors
  if (error.statusCode === 404) {
    return 'The requested resource was not found. Please check your API endpoint configuration.'
  }

  // Handle forbidden errors
  if (error.statusCode === 403) {
    return 'Access forbidden. Please check your API key permissions.'
  }

  // Handle rate limiting
  if (error.statusCode === 429) {
    return 'Too many requests. Please wait a moment and try again.'
  }

  // Use the error message if available
  if (error.message) {
    return error.message
  }

  // Use status message if available
  if (error.statusMessage) {
    return error.statusMessage
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Checks if an error is an API key error
 */
export function isApiKeyError(error: any): boolean {
  return (
    error?.message?.includes('API key') ||
    error?.statusCode === 401 ||
    error?.data?.message?.includes('API key')
  )
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('ENOTFOUND')
  )
}

/**
 * Safely serializes data, converting non-serializable values
 */
function safeSerialize(data: any): any {
  if (data === null || data === undefined) {
    return null
  }
  
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return data
  }
  
  if (data instanceof Date) {
    return data.toISOString()
  }
  
  if (data instanceof Error) {
    return {
      message: data.message,
      stack: data.stack,
      name: data.name
    }
  }
  
  if (Array.isArray(data)) {
    return data.map(item => safeSerialize(item))
  }
  
  if (typeof data === 'object') {
    const result: Record<string, any> = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        try {
          result[key] = safeSerialize(data[key])
        } catch {
          // Skip non-serializable properties
          result[key] = '[Non-serializable]'
        }
      }
    }
    return result
  }
  
  return String(data)
}

/**
 * Converts an error to a plain object that can be serialized
 */
export function errorToPlainObject(error: any): Record<string, any> {
  if (!error) {
    return { message: 'An unknown error occurred' }
  }

  // If it's already a plain object, ensure all nested data is serializable
  if (error && typeof error === 'object' && !(error instanceof Error)) {
    return {
      message: error.message || error.statusMessage || 'An error occurred',
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: safeSerialize(error.data),
      stack: error.stack
    }
  }

  // Convert Error instance to plain object
  return {
    message: error.message || error.statusMessage || 'An error occurred',
    statusCode: error.statusCode,
    statusMessage: error.statusMessage,
    data: safeSerialize(error.data),
    stack: error.stack
  }
}

/**
 * Creates a user-friendly error object (returns a plain object for serialization)
 * This should be used when throwing errors to ensure they're serializable
 */
export function createUserFriendlyError(error: any): Record<string, any> {
  // If error is already a plain object with message, use it
  if (error && typeof error === 'object' && !(error instanceof Error) && error.message) {
    return {
      message: formatApiError(error),
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: safeSerialize(error.data),
      stack: error.stack
    }
  }
  
  const message = formatApiError(error)
  
  // Return a plain object instead of Error instance for serialization
  // Ensure all nested data is serializable
  return {
    message,
    statusCode: error?.statusCode,
    statusMessage: error?.statusMessage,
    data: safeSerialize(error?.data),
    stack: error?.stack
  }
}

/**
 * Creates a serializable error object for throwing
 * Use this instead of `throw new Error()` to ensure serialization works
 */
export function createSerializableError(message: string, statusCode?: number, data?: any): Record<string, any> {
  return {
    message,
    statusCode,
    data: safeSerialize(data)
  }
}

