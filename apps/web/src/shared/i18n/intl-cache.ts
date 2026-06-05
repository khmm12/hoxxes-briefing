type Locales = string | string[]

const cache = /* @__PURE__ */ new Map<string, unknown>()

export function getDateTimeFormat(locales: Locales, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const _locales = normalizeLocales(locales)

  return getMemoized(
    () => cacheKey('date', _locales, options),
    () => new Intl.DateTimeFormat(_locales, options),
  )
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

// Locale order is the resolution priority — it must stay part of the key,
// so no sorting. Options keys are assumed to come from literal callsites;
// a differently-ordered duplicate only costs an extra cache entry.
function cacheKey(type: string, locales: readonly string[], options?: unknown) {
  return `${type}:${JSON.stringify([locales, options])}`
}
