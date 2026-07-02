import { Locale, type SupportedLocale } from './locale'

type LocaleLoader = () => Promise<{ readonly messages: Record<string, string> }>

export const localeLoaders = {
  [Locale.English]: () => import('./locales/en'),
} satisfies Record<SupportedLocale, LocaleLoader>
