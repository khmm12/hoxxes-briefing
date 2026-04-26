// @ts-check
import { defineConfig } from '@lingui/cli'

export default defineConfig({
  compileNamespace: 'es',
  fallbackLocales: { default: 'en' },
  locales: ['en'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/src/shared/i18n/locales/{locale}/messages',
      include: ['<rootDir>/src'],
      exclude: ['**/*.test.*', '**/*.d.ts'],
    },
  ],
})
