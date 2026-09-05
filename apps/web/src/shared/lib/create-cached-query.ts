import { createMemo, isPending, onCleanup, refresh as refreshComputation } from 'solid-js'

type CachedQueryCache<K, T> = {
  get: (key: K) => Promise<T | undefined> | T | undefined
  set: (key: K, value: T) => Promise<void> | void
}

export type CreateCachedQueryOptions<K, T> = {
  source: () => K
  fetcher: (key: K, ctx: { signal: AbortSignal }) => Promise<T>
  cache: CachedQueryCache<K, T>
  /**
   * A stale cached value waits out `timeoutMs` so the network can win the
   * race; a non-stale one is served immediately (still revalidated in the
   * background). Without the predicate every cached value waits.
   */
  isStale?: (value: T) => boolean
  /**
   * A fetch error the UI must always see, even when a cached value could
   * mask it. Non-fatal errors on a cache-served cold start are swallowed
   * (the cached value stands in); fatal ones surface as `lastRefreshError`.
   */
  isFatal?: (error: unknown) => boolean
  timeoutMs?: number
  equal?: (left: T, right: T) => boolean
}

export type CachedQuery<T> = {
  get data(): T
  get source(): QuerySource
  get pending(): boolean
  get lastRefreshError(): unknown | null
  refresh: () => void
}

export type StreamCachedQueryOptions<K, T> = {
  cache: CachedQueryCache<K, T>
  fetcher: (key: K, ctx: { signal: AbortSignal }) => Promise<T>
  isStale?: (value: T) => boolean
  isFatal?: (error: unknown) => boolean
  key: K
  previous?: InnerState<K, T>
  signal: AbortSignal
  timeoutMs: number
}

type RefreshState = { status: 'ok' } | { status: 'refreshing' } | { status: 'failed'; error: unknown; at: number }

type InnerState<K, T> = {
  key: K
  source: 'cache' | 'network'
  value: T
  refresh: RefreshState
}

type QuerySource = 'network' | 'cache'

export function createCachedQuery<const K extends readonly unknown[], T>(
  options: CreateCachedQueryOptions<K, T>,
): CachedQuery<T> {
  const timeoutMs = options.timeoutMs ?? 150
  // Persistence must not hold up rendering, but successive refreshes must
  // still reach storage in order so a slow older write cannot win last.
  let cacheWrite = Promise.resolve()
  const cache: CachedQueryCache<K, T> = {
    get: (key) => options.cache.get(key),
    set(key, value) {
      const write = cacheWrite.then(() => options.cache.set(key, value))
      cacheWrite = write.catch(() => {})
      return write
    },
  }

  const s = createMemo<InnerState<K, T>>(async function* (prev) {
    const key = options.source()
    // A re-run with an unchanged key is a refresh(); a key change starts a fresh query.
    const previous = prev != null && isSameKey(prev.key, key) ? prev : undefined

    const abortController = new AbortController()

    onCleanup(() => {
      abortController.abort()
    })

    yield* streamCachedQuery({
      cache,
      fetcher: options.fetcher,
      isStale: options.isStale,
      isFatal: options.isFatal,
      key,
      previous,
      signal: abortController.signal,
      timeoutMs,
    })
  })

  const data = createMemo(() => s().value, { equals: options.equal, lazy: true })
  const pending = createMemo(
    () => {
      try {
        return isPending(s) || s().refresh.status === 'refreshing'
      } catch {
        return false
      }
    },
    { lazy: true },
  )

  return {
    get data() {
      return data()
    },
    get source() {
      return s().source
    },
    get lastRefreshError() {
      try {
        const { refresh } = s()
        return refresh.status === 'failed' ? refresh.error : null
      } catch {
        return null
      }
    },
    get pending() {
      return pending()
    },
    refresh() {
      refreshComputation(s)
    },
  }
}

const ok = <K, T>(key: K, source: 'cache' | 'network', value: T): InnerState<K, T> => ({
  key,
  source,
  value,
  refresh: { status: 'ok' },
})

const refreshInFlight = <K, T>(state: Pick<InnerState<K, T>, 'key' | 'source' | 'value'>): InnerState<K, T> => ({
  key: state.key,
  source: state.source,
  value: state.value,
  refresh: { status: 'refreshing' },
})

const refreshFailed = <K, T>(
  state: Pick<InnerState<K, T>, 'key' | 'source' | 'value'>,
  error: unknown,
): InnerState<K, T> => ({
  key: state.key,
  source: state.source,
  value: state.value,
  refresh: { status: 'failed', error, at: Date.now() },
})

export async function* streamCachedQuery<K, T>(
  options: StreamCachedQueryOptions<K, T>,
): AsyncGenerator<InnerState<K, T>> {
  const networkPromise = (async () => {
    const value = await options.fetcher(options.key, { signal: options.signal })

    if (!options.signal.aborted) {
      // Storage is best-effort, including slow writes, not just rejected ones.
      // Observe sync throws and async rejections without delaying the network.
      void Promise.resolve()
        .then(() => options.cache.set(options.key, value))
        .catch((error) => console.warn('[cached-query] failed to persist the fetched value', error))
    }

    return value
  })()

  if (options.previous != null) {
    try {
      yield ok(options.key, 'network', await networkPromise)
    } catch (error) {
      yield refreshFailed(options.previous, error)
    }

    return
  }

  // CacheStorage is a best-effort read-through layer. A denied or otherwise
  // failed read must behave exactly like a miss so it cannot mask the network
  // result (or replace a network error when both operations fail).
  const cachedPromise = Promise.resolve()
    .then(() => options.cache.get(options.key))
    .catch(() => undefined)
  const networkResultPromise = networkPromise.then((value) => ok(options.key, 'network', value))
  const gracePromise = sleep(options.timeoutMs)
  const cachedResultPromise = (async () => {
    const cachedValue = await cachedPromise
    if (cachedValue === undefined) return networkResultPromise

    // A stale cached value waits out the grace period to give the network a
    // chance to win the race; a non-stale one is served right away.
    if (options.isStale?.(cachedValue) ?? true) await gracePromise

    return refreshInFlight({ key: options.key, source: 'cache', value: cachedValue })
  })()

  try {
    const first = await Promise.race([networkResultPromise, cachedResultPromise])

    if (first.source === 'network') {
      yield first
      return
    }

    yield first

    try {
      yield ok(options.key, 'network', await networkPromise)
    } catch (error) {
      // The cached value stands in for a failed revalidation — except for
      // fatal errors, which the UI must see even over perfectly good cache.
      if (options.isFatal?.(error)) yield refreshFailed(first, error)
      else yield ok(options.key, first.source, first.value)
    }
  } catch (error) {
    const cachedValue = await cachedPromise
    if (cachedValue === undefined) throw error

    const fallback = { key: options.key, source: 'cache' as const, value: cachedValue }
    if (options.isFatal?.(error)) yield refreshFailed(fallback, error)
    else yield ok(options.key, 'cache', cachedValue)
  }
}

export function isSameKey(left: readonly unknown[], right: readonly unknown[]): boolean {
  return left.length === right.length && left.every((value, index) => Object.is(value, right[index]))
}

function sleep(durationMs: number): Promise<void> {
  if (durationMs <= 0) durationMs = 0

  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, durationMs)
  })
}
