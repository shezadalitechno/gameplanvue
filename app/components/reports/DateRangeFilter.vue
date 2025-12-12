<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { sub } from 'date-fns'

const props = defineProps<{
  modelValue?: { start: Date; end: Date }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: { start: Date; end: Date }]
}>()

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]!
}

function parseDateFromInput(dateString: string): Date {
  return new Date(dateString)
}

const startDateInput = ref(formatDateForInput(props.modelValue?.start || sub(new Date(), { days: 7 })))
const endDateInput = ref(formatDateForInput(props.modelValue?.end || new Date()))

const dateRange = computed({
  get: () => ({
    start: parseDateFromInput(startDateInput.value),
    end: parseDateFromInput(endDateInput.value)
  }),
  set: (value) => {
    startDateInput.value = formatDateForInput(value.start)
    endDateInput.value = formatDateForInput(value.end)
    emit('update:modelValue', value)
  }
})

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This month', getDates: () => {
    const now = new Date()
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: now
    }
  }}
]

function selectPreset(preset: typeof presets[0]) {
  if (preset.days) {
    const newRange = {
      start: sub(new Date(), { days: preset.days }),
      end: new Date()
    }
    dateRange.value = newRange
  } else if (preset.getDates) {
    dateRange.value = preset.getDates()
  }
}

watch([startDateInput, endDateInput], () => {
  emit('update:modelValue', dateRange.value)
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    startDateInput.value = formatDateForInput(newValue.start)
    endDateInput.value = formatDateForInput(newValue.end)
  }
}, { deep: true })
</script>

<template>
  <div class="flex items-center gap-3">
    <UInput
      v-model="startDateInput"
      type="date"
      placeholder="Start date"
      class="min-w-40"
    />
    <span class="text-muted">to</span>
    <UInput
      v-model="endDateInput"
      type="date"
      placeholder="End date"
      class="min-w-40"
    />

    <div class="flex gap-2">
      <UButton
        v-for="preset in presets"
        :key="preset.label"
        :label="preset.label"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="selectPreset(preset)"
      />
    </div>
  </div>
</template>

