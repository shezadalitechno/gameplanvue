<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useApiStore } from '~/stores/api'

const fileRef = ref<HTMLInputElement>()
const apiStore = useApiStore()
const showApiKeyModal = ref(false)

onMounted(() => {
  apiStore.loadApiKey()
})

const profileSchema = z.object({
  name: z.string().min(2, 'Too short'),
  email: z.string().email('Invalid email'),
  username: z.string().min(2, 'Too short'),
  avatar: z.string().optional(),
  bio: z.string().optional()
})

type ProfileSchema = z.output<typeof profileSchema>

const profile = reactive<Partial<ProfileSchema>>({
  name: 'techno',
  email: '',
  username: 'techno',
  avatar: undefined,
  bio: undefined
})
const toast = useToast()
async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  toast.add({
    title: 'Success',
    description: 'Your settings have been updated.',
    icon: 'i-lucide-check',
    color: 'success'
  })
  console.log(event.data)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  profile.avatar = URL.createObjectURL(input.files[0]!)
}

function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Profile"
      description="These informations will be displayed publicly."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Save changes"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="Name"
        description="Will appear on receipts, invoices, and other communication."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.name"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Email"
        description="Used to sign in, for email receipts and product updates."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.email"
          type="email"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="Username"
        description="Your unique username for logging in and your profile URL."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.username"
          type="username"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar"
        label="Avatar"
        description="JPG, GIF or PNG. 1MB Max."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            :src="profile.avatar"
            :alt="profile.name"
            size="lg"
          />
          <UButton
            label="Choose"
            color="neutral"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          >
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="Bio"
        description="Brief description for your profile. URLs are hyperlinked."
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea
          v-model="profile.bio"
          :rows="5"
          autoresize
          class="w-full"
        />
      </UFormField>
    </UPageCard>

    <!-- API Key Management -->
    <UPageCard
      title="API Key Management"
      description="Configure your GamePlan API connection."
      variant="naked"
      orientation="horizontal"
      class="mb-4 mt-6"
    >
      <UButton
        :label="apiStore.isAuthenticated ? 'Update API Key' : 'Set API Key'"
        color="primary"
        @click="showApiKeyModal = true"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Connection Status</p>
            <p class="text-sm text-muted">
              {{ apiStore.isAuthenticated ? 'Connected' : 'Not connected' }}
            </p>
          </div>
          <UBadge
            :color="apiStore.isAuthenticated ? 'success' : 'error'"
            variant="subtle"
          >
            {{ apiStore.isAuthenticated ? 'Active' : 'Inactive' }}
          </UBadge>
        </div>

        <USeparator />

        <div v-if="apiStore.isAuthenticated">
          <p class="text-sm text-muted mb-2">API Key: ••••••••••••••••</p>
          <UButton
            label="Test Connection"
            color="neutral"
            variant="outline"
            size="sm"
            :loading="apiStore.isTestingConnection"
            @click="apiStore.testConnection()"
          />
          <UButton
            label="Clear API Key"
            color="error"
            variant="ghost"
            size="sm"
            class="ml-2"
            @click="apiStore.clearApiKey()"
          />
        </div>

        <div v-if="apiStore.connectionError" class="p-3 bg-error/10 border border-error/20 rounded">
          <p class="text-sm text-error">{{ apiStore.connectionError }}</p>
        </div>
      </div>
    </UPageCard>
  </UForm>

  <CommonApiKeySetup v-model="showApiKeyModal" />
</template>
