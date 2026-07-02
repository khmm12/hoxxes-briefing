export enum Locale {
  English = 'en-US',
}

export const defaultLocale = Locale.English

const supportedLocales = [Locale.English] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export function resolveLocale(candidates: readonly string[]): SupportedLocale {
  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase()

    if (normalized.startsWith('en')) {
      return Locale.English
    }
  }

  return defaultLocale
}
