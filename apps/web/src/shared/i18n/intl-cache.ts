type Locales = string | string[]

const cache = /* @__PURE__ */ new Map<string, unknown>()

export const defaultLocale = 'en'

export type DateTimeFormatValue = Parameters<Intl.DateTimeFormat['format']>[0]
export type NumberFormatValue = Parameters<Intl.NumberFormat['format']>[0]

export function date(locales: Locales, date?: number | Date | undefined, format?: Intl.DateTimeFormatOptions): string {
  const _locales = normalizeLocales(locales)

  const formatter = getMemoized(
    () => cacheKey('date', _locales, format),
    () => new Intl.DateTimeFormat(_locales, format),
  )

  return formatter.format(date)
}

export function number(locales: Locales, value: NumberFormatValue, format?: Intl.NumberFormatOptions): string {
  const _locales = normalizeLocales(locales)

  const formatter = getMemoized(
    () => cacheKey('number', _locales, format),
    () => new Intl.NumberFormat(_locales, format),
  )

  return formatter.format(value)
}

function normalizeLocales(locales: Locales): string[] {
  return Array.isArray(locales) ? locales : [locales]
}

function getMemoized<T>(getKey: () => string, construct: () => T) {
  const key = getKey()

  let formatter = cache.get(key) as T

  if (!formatter) {
    formatter = construct()
    cache.set(key, formatter)
  }

  return formatter
}

function cacheKey(type: string, locales: readonly string[], options?: unknown) {
  const separator = '-'
  const localeKey = Array.isArray(locales) ? locales.slice().sort().join(separator) : locales
  const optionsKey = JSON.stringify(options)

  let key = type
  if (localeKey !== '') key += separator + localeKey
  if (optionsKey !== '') key += (key !== '' ? separator : '') + optionsKey
  return key
}
