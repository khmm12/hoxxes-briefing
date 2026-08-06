import { Locale, type SupportedLocale } from './locale'
import { messages as englishMessages } from './locales/en'

type LocaleLoader = () => Promise<{ readonly messages: Record<string, string> }>

export const localeLoaders = {
  [Locale.English]: () => Promise.resolve({ messages: englishMessages }),
} satisfies Record<SupportedLocale, LocaleLoader>
