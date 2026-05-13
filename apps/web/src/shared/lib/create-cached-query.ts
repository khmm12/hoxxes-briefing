import { createMemo, isPending, isRefreshing, onCleanup, refresh as refreshComputation } from 'solid-js'

export type CachedQueryCache<K, T> = {
  get: (key: K) => Promise<T | undefined> | T | undefined
  set: (key: K, value: T) => Promise<void> | void
}

export type CreateCachedQueryOptions<K, T> = {
  source: () => K
  fetcher: (key: K, ctx: { signal: AbortSignal }) => Promise<T>
  cache: CachedQueryCache<K, T>
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
  equal: (left: T, right: T) => boolean
  fetcher: (key: K, ctx: { signal: AbortSignal }) => Promise<T>
  key: K
  previous?: InnerState<T>
  signal: AbortSignal
  timeoutMs: number
}

type RefreshState = { status: 'ok' } | { status: 'refreshing' } | { status: 'failed'; error: unknown; at: number }

type InnerState<T> = {
  source: 'cache' | 'network'
  value: T
  refresh: RefreshState
}

type QuerySource = 'network' | 'cache'

const ok = <T>(source: 'cache' | 'network', value: T): InnerState<T> => ({
  source,
  value,
  refresh: { status: 'ok' },
})

const refreshInFlight = <T>(state: Pick<InnerState<T>, 'source' | 'value'>): InnerState<T> => ({
  source: state.source,
  value: state.value,
  refresh: { status: 'refreshing' },
})

export function createCachedQuery<const K extends readonly unknown[], T>(
  options: CreateCachedQueryOptions<K, T>,
): CachedQuery<T> {
  const timeoutMs = options.timeoutMs ?? 150
  const equal = options.equal ?? Object.is

  const s = createMemo<InnerState<T>>(async function* (prev) {
    const isInitialRequest = !isRefreshing()
    const key = options.source()

    const abortController = new AbortController()

    onCleanup(() => {
      abortController.abort()
    })

    yield* streamCachedQuery({
      cache: options.cache,
      equal,
      fetcher: options.fetcher,
      key,
      previous: isInitialRequest ? undefined : prev,
      signal: abortController.signal,
      timeoutMs,
    })
  })

  return {
    get data() {
      return s().value
    },
    get source() {
      return s().source
    },
    get lastRefreshError() {
      const { refresh } = s()

      return refresh.status === 'failed' ? refresh.error : null
    },
    get pending() {
      if (isPending(() => s())) return true

      try {
        return s().refresh.status === 'refreshing'
      } catch {
        return false
      }
    },
    refresh() {
      refreshComputation(s)
    },
  }
}

const refreshFailed = <T>(state: Pick<InnerState<T>, 'source' | 'value'>, error: unknown): InnerState<T> => ({
  source: state.source,
  value: state.value,
  refresh: { status: 'failed', error, at: Date.now() },
})

export async function* streamCachedQuery<K, T>(options: StreamCachedQueryOptions<K, T>): AsyncGenerator<InnerState<T>> {
  const networkPromise = (async () => {
    const value = await options.fetcher(options.key, { signal: options.signal })
    await options.cache.set(options.key, value)
    return value
  })()

  if (options.previous != null) {
    try {
      yield ok('network', await networkPromise)
    } catch (error) {
      yield refreshFailed(options.previous, error)
    }

    return
  }

  const cachedPromise = options.cache.get(options.key)
  const networkResultPromise = networkPromise.then((value) => ok('network', value))
  const cacheAfterTimeoutPromise = (async () => {
    const [cachedValue] = await Promise.all([cachedPromise, sleep(options.timeoutMs)])

    return cachedValue === undefined ? networkResultPromise : refreshInFlight({ source: 'cache', value: cachedValue })
  })()

  try {
    const first = await Promise.race([networkResultPromise, cacheAfterTimeoutPromise])

    if (first.source === 'network') {
      yield first
      return
    }

    yield first

    try {
      const freshValue = await networkPromise
      const value = !options.equal(first.value, freshValue) ? freshValue : first.value
      yield ok('network', value)
    } catch {
      yield ok(first.source, first.value)
    }
  } catch (error) {
    const cachedValue = await cachedPromise
    if (cachedValue === undefined) throw error

    yield ok('cache', cachedValue)
  }
}

function sleep(durationMs: number): Promise<void> {
  if (durationMs <= 0) durationMs = 0

  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, durationMs)
  })
}
