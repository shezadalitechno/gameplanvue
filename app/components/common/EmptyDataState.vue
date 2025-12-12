<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
  icon?: string
  actionText?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <UIcon
      v-if="icon"
      :name="icon"
      class="size-12 text-muted mb-4"
    />
    <h3 class="text-lg font-semibold text-highlighted mb-2">
      {{ title || 'No data available' }}
    </h3>
    <p v-if="description" class="text-muted max-w-md">
      {{ description }}
    </p>
    <UButton
      v-if="actionText"
      :label="actionText"
      color="primary"
      class="mt-4"
      @click="emit('action')"
    />
  </div>
</template>

