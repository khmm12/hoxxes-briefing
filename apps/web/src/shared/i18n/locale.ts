export const defaultLocale = 'en-US' as const

export const supportedLocales = ['en-US'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export function resolveLocale(candidates: readonly string[]): SupportedLocale {
  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase()

    if (normalized.startsWith('en')) {
      return 'en-US'
    }
  }

  return defaultLocale
}
