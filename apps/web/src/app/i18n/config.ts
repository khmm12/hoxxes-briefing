import { setupI18n } from '@lingui/core'
import { defaultLocale, localeLoaders, resolveLocale } from '~/shared/i18n'

const locale = resolveLocale(typeof navigator === 'undefined' ? [defaultLocale] : navigator.languages)

export async function createAppI18n() {
  const { messages } = await localeLoaders[locale]()

  return setupI18n({
    locale,
    messages: {
      [locale]: messages,
    },
  })
}
