<script setup lang="ts">
const props = defineProps<{
  error: Error | null
  request?: {
    url?: string
    method?: string
  }
}>()

const expanded = ref(false)

function copyToClipboard() {
  const text = JSON.stringify({
    error: props.error?.message,
    stack: props.error?.stack,
    request: props.request
  }, null, 2)

  navigator.clipboard.writeText(text)
}
</script>

<template>
  <UCard v-if="error" color="error" variant="subtle">
    <div class="flex items-start justify-between">
      <div>
        <p class="font-medium text-error">Error</p>
        <p class="text-sm text-muted mt-1">{{ error.message }}</p>
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

      <div v-if="error.stack">
        <p class="text-xs text-muted">Stack trace:</p>
        <pre class="text-xs bg-elevated p-2 rounded overflow-auto max-h-40">{{ error.stack }}</pre>
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

