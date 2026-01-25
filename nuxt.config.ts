import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  modules: [
    '@nuxtjs/i18n',
  ],
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
