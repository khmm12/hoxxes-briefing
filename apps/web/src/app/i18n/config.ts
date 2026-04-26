import { setupI18n } from '@lingui/core'
import { defaultLocale, resolveLocale, type SupportedLocale } from '~/shared/i18n'

const locale = resolveLocale(typeof navigator === 'undefined' ? [defaultLocale] : navigator.languages)

const localeLoaders = {
  'en-US': () => import('~/shared/i18n/locales/en'),
} satisfies Record<SupportedLocale, () => Promise<{ messages: Record<string, unknown> }>>

export async function createAppI18n() {
  const { messages } = await localeLoaders[locale]()

  return setupI18n({
    locale,
    messages: {
      [locale]: messages,
    },
  })
}
