export default defineNuxtPlugin(() => {
  const apiStore = useApiStore()
  
  // Load API key from localStorage on app initialization
  if (typeof window !== 'undefined') {
    apiStore.loadApiKey()
  }
})

