export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path')
  const query = getQuery(event)

  // Get API key from request header (client-provided) or fallback to server config
  const apiKeyHeader = getHeader(event, 'x-api-key') || getHeader(event, 'authorization')?.replace('Bearer ', '').replace('token ', '')
  const apiKey = apiKeyHeader || config.gameplanApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'GamePlan API key is required. Please provide it via X-API-Key header or configure it on the server.'
    })
  }

  const baseUrl = config.public.gameplanApiBaseUrl || 'https://portal.technoservesolutions.com/api/resource/'
  // Construct URL - baseUrl ends with /, path is the DocType name like "GP Task"
  // Decode the path to get the original doctype name (handles URL encoding from client)
  const decodedPath = path ? decodeURIComponent(path) : ''
  const fullPath = decodedPath ? `${baseUrl}${decodedPath}` : baseUrl.slice(0, -1) // Remove trailing slash if no path
  const url = new URL(fullPath)

  // Add query parameters
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle array values (like fields JSON)
      if (Array.isArray(value)) {
        url.searchParams.append(key, JSON.stringify(value))
      } else {
        url.searchParams.append(key, String(value))
      }
    }
  })

  try {
    const response = await $fetch(url.toString(), {
      method: event.method || 'GET',
      headers: {
        'Authorization': `token ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Ensure consistent response format
    return response
  } catch (error: any) {
    // Log detailed error for debugging
    console.error('GamePlan API Error:', {
      url: url.toString(),
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      message: error.message,
      data: error.data
    })

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'GamePlan API request failed',
      data: error.data || error.message
    })
  }
})

