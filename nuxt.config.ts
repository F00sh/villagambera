import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  modules: [
    '@nuxtjs/i18n',
  ],
  runtimeConfig: {
    // Private server-only keys
    beds24ApiKey: process.env.BEDS24_API_KEY,
    beds24PropKey: process.env.BEDS24_PROP_KEY,
    // Public values safe to expose to client
    public: {
      beds24PropertyId: process.env.BEDS24_PROPERTY_ID || '151309',
    },
  },
  i18n: {
    locales: [
      { code: 'en', iso: 'en', name: 'English' },
      { code: 'hr', iso: 'hr', name: 'Hrvatski' },
      { code: 'de', iso: 'de', name: 'Deutsch' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    compilation: {
      strictMessage: false,
    },
    vueI18n: './vue-i18n.options.ts',
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});
