export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path')
  const query = getQuery(event)

  if (!config.gameplanApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GamePlan API key not configured'
    })
  }

  const baseUrl = config.public.gameplanApiBaseUrl || 'https://portal.technoservesolutions.com/api/resource/'
  // Construct URL - baseUrl ends with /, path is the DocType name like "GP Task"
  const fullPath = path ? `${baseUrl}${path}` : baseUrl.slice(0, -1) // Remove trailing slash if no path
  const url = new URL(fullPath)

  // Add query parameters
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  })

  try {
    const response = await $fetch(url.toString(), {
      method: event.method || 'GET',
      headers: {
        'Authorization': `token ${config.gameplanApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'GamePlan API request failed',
      data: error.data || error.message
    })
  }
})

