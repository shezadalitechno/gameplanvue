<script setup lang="ts">
import { useApiStore } from '~/stores/api'

const apiStore = useApiStore()
const apiKey = ref('')
const isOpen = defineModel<boolean>({ default: false })

watch(isOpen, (newValue) => {
  if (newValue) {
    // Only load when modal opens
    apiStore.loadApiKey()
    apiKey.value = apiStore.apiKey || ''
  } else {
    // Reset when closing
    apiKey.value = ''
    apiStore.connectionError = null
  }
})

async function saveApiKey() {
  apiStore.setApiKey(apiKey.value)
  const success = await apiStore.testConnection()
  if (success) {
    isOpen.value = false
  }
}

function cancel() {
  apiKey.value = apiStore.apiKey
  isOpen.value = false
}
</script>

<template>
  <UModal v-model="isOpen" :ui="{ width: 'w-full sm:max-w-md' }">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">API Key Setup</h3>
      </template>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">GamePlan API Key</label>
          <UInput
            v-model="apiKey"
            type="password"
            placeholder="Enter your API key"
            :disabled="apiStore.isTestingConnection"
          />
        </div>

        <div v-if="apiStore.connectionError" class="p-3 bg-error/10 border border-error/20 rounded">
          <p class="text-sm text-error">{{ apiStore.connectionError }}</p>
        </div>

        <div v-if="apiStore.isAuthenticated && !apiStore.connectionError" class="p-3 bg-success/10 border border-success/20 rounded">
          <p class="text-sm text-success">Connection successful</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="cancel"
          />
          <UButton
            label="Test Connection"
            color="primary"
            :loading="apiStore.isTestingConnection"
            @click="apiStore.testConnection()"
          />
          <UButton
            label="Save"
            color="primary"
            :disabled="!apiKey || apiStore.isTestingConnection"
            @click="saveApiKey"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

