// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  runtimeConfig: {
    // Private keys (server-side only)
    gameplanApiKey: process.env.VITE_GAMEPLAN_API_KEY || '',
    // Public keys (exposed to client)
    public: {
      gameplanApiBaseUrl: process.env.VITE_GAMEPLAN_API_BASE_URL || 'https://portal.technoservesolutions.com/api/resource/'
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  nitro: {
    // Optimize build performance and prevent hangs
    preset: 'node-server',
    // Disable experimental features that might cause hangs
    experimental: {
      wasm: false
    },
    // Reduce build complexity
    prerender: {
      crawlLinks: false
    },
    // Add build optimizations
    esbuild: {
      options: {
        target: 'node18'
      }
    }
  }
})
