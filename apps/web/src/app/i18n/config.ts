import { setupI18n } from '@lingui/core'
import { defaultLocale, localeLoaders, resolveLocale } from '~/shared/i18n'

export async function createAppI18n() {
  const locale = resolveLocale(typeof navigator === 'undefined' ? [defaultLocale] : navigator.languages)
  const { messages } = await localeLoaders[locale]()

  return setupI18n({
    locale,
    messages: {
      [locale]: messages,
    },
  })
}
