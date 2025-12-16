<script setup lang="ts">
import { isApiKeyError as checkApiKeyError } from '~/composables/utils/errorUtils'

const props = defineProps<{
  error: Error | Record<string, any> | null
  request?: {
    url?: string
    method?: string
  }
}>()

const expanded = ref(false)

const isApiKeyError = computed(() => {
  return checkApiKeyError(props.error)
})

// Normalize error to plain object
const errorObj = computed(() => {
  if (!props.error) return null
  if (props.error instanceof Error) {
    return {
      message: props.error.message,
      stack: props.error.stack,
      name: props.error.name
    }
  }
  return props.error
})

function copyToClipboard() {
  const text = JSON.stringify({
    error: errorObj.value,
    request: props.request
  }, null, 2)

  navigator.clipboard.writeText(text)
}
</script>

<template>
  <UCard v-if="errorObj" color="error" variant="subtle">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="font-medium text-error">Error</p>
        <p class="text-sm text-muted mt-1">{{ errorObj.message || 'An error occurred' }}</p>
        <div v-if="isApiKeyError" class="mt-3">
          <UButton
            to="/settings"
            color="primary"
            variant="outline"
            size="sm"
            icon="i-lucide-settings"
            label="Go to Settings"
          />
        </div>
      </div>
      <UButton
        :icon="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="expanded = !expanded"
      />
    </div>

    <div v-if="expanded" class="mt-4 space-y-2">
      <div v-if="request?.url">
        <p class="text-xs text-muted">Request URL:</p>
        <code class="text-xs">{{ request.url }}</code>
      </div>

      <div v-if="request?.method">
        <p class="text-xs text-muted">Method:</p>
        <code class="text-xs">{{ request.method }}</code>
      </div>

      <div v-if="errorObj.stack">
        <p class="text-xs text-muted">Stack trace:</p>
        <pre class="text-xs bg-elevated p-2 rounded overflow-auto max-h-40">{{ errorObj.stack }}</pre>
      </div>
      
      <div v-if="errorObj.statusCode">
        <p class="text-xs text-muted">Status Code:</p>
        <code class="text-xs">{{ errorObj.statusCode }}</code>
      </div>
      
      <div v-if="errorObj.statusMessage">
        <p class="text-xs text-muted">Status Message:</p>
        <code class="text-xs">{{ errorObj.statusMessage }}</code>
      </div>

      <UButton
        label="Copy to clipboard"
        size="xs"
        color="neutral"
        variant="outline"
        icon="i-lucide-copy"
        @click="copyToClipboard"
      />
    </div>
  </UCard>
</template>

