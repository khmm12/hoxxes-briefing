import type { SupportedLocale } from './locale'

export const localeLoaders = {
  'en-US': () => import('./locales/en'),
} satisfies Record<SupportedLocale, () => Promise<{ messages: Record<string, unknown> }>>
