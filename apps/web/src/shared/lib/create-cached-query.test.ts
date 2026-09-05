import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSignal, flush, resolve } from 'solid-js'
import { renderHook } from '@solidjs/testing-library'
import { createCachedQuery, isSameKey, streamCachedQuery } from './create-cached-query'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('streamCachedQuery', () => {
  it('serves the network value before a slow cache write completes', async () => {
    const write = createDeferred<void>()
    const cache = { get: () => undefined, set: vi.fn(() => write.promise) }
    const iterator = streamCachedQuery({
      cache,
      fetcher: async () => 'fresh',
      key: [],
      signal: new AbortController().signal,
      timeoutMs: 0,
    })

    await expect(iterator.next()).resolves.toMatchObject({ value: { value: 'fresh', source: 'network' } })
    await expect(iterator.next()).resolves.toMatchObject({ done: true })
    expect(cache.set).toHaveBeenCalledOnce()
    write.resolve()
  })

  it('does not persist a late response after the request was aborted', async () => {
    const network = createDeferred<string>()
    const abort = new AbortController()
    const cache = { get: () => undefined, set: vi.fn() }
    const iterator = streamCachedQuery({
      cache,
      fetcher: () => network.promise,
      key: [],
      signal: abort.signal,
      timeoutMs: 0,
    })

    const first = iterator.next()
    abort.abort()
    network.resolve('superseded')
    await first
    expect(cache.set).not.toHaveBeenCalled()
  })

  it('yields the network value directly when the request wins the grace period', async () => {
    const key = ['weekly'] as const
    const networkValue = {
      source: 'network',
      weekId: '2026-W17',
    }
    const cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn().mockResolvedValue(networkValue),
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'ok' },
        source: 'network',
        value: networkValue,
      },
    })
    await expect(iterator.next()).resolves.toMatchObject({
      done: true,
      value: undefined,
    })

    expect(cache.get).toHaveBeenCalledOnce()
    expect(cache.set).toHaveBeenCalledOnce()
    expect(cache.set).toHaveBeenCalledWith(key, networkValue)
  })

  it('yields cached data first and then yields the fresh value after the timeout', async () => {
    vi.useFakeTimers()

    const key = ['weekly'] as const
    const cachedValue = {
      source: 'cache',
      weekId: '2026-W17',
    }
    const freshValue = {
      source: 'network',
      weekId: '2026-W18',
    }
    const networkRequest = createDeferred<typeof freshValue>()
    const cache = {
      get: vi.fn().mockResolvedValue(cachedValue),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn(() => networkRequest.promise),
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    const firstValue = iterator.next()
    await vi.advanceTimersByTimeAsync(150)
    await expect(firstValue).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'refreshing' },
        source: 'cache',
        value: cachedValue,
      },
    })

    networkRequest.resolve(freshValue)

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'ok' },
        source: 'network',
        value: freshValue,
      },
    })
    await expect(iterator.next()).resolves.toMatchObject({
      done: true,
      value: undefined,
    })

    expect(cache.set).toHaveBeenCalledOnce()
    expect(cache.set).toHaveBeenCalledWith(key, freshValue)
  })

  it('surfaces a fatal fetch error as a failed refresh instead of hiding it behind the cache', async () => {
    const key = ['weekly'] as const
    const cachedValue = { weekId: '2026-W17' }
    const fatalError = new Error('outdated')
    const networkRequest = createDeferred<typeof cachedValue>()
    const cache = {
      get: vi.fn().mockResolvedValue(cachedValue),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn(() => networkRequest.promise),
      isFatal: (error) => error === fatalError,
      isStale: () => false,
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: { refresh: { status: 'refreshing' }, source: 'cache', value: cachedValue },
    })

    networkRequest.reject(fatalError)

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: { refresh: { status: 'failed', error: fatalError }, source: 'cache', value: cachedValue },
    })
  })

  it('still hides a non-fatal fetch error behind a served cached value', async () => {
    const key = ['weekly'] as const
    const cachedValue = { weekId: '2026-W17' }
    const networkRequest = createDeferred<typeof cachedValue>()
    const cache = {
      get: vi.fn().mockResolvedValue(cachedValue),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn(() => networkRequest.promise),
      isFatal: () => false,
      isStale: () => false,
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    await iterator.next()
    networkRequest.reject(new Error('offline'))

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: { refresh: { status: 'ok' }, source: 'cache', value: cachedValue },
    })
  })

  it('serves a fetched value even when persisting it to cache fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const key = ['weekly'] as const
    const networkValue = { weekId: '2026-W18' }
    const cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockRejectedValue(new Error('quota exceeded')),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn().mockResolvedValue(networkValue),
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: { refresh: { status: 'ok' }, source: 'network', value: networkValue },
    })
    expect(warnSpy).toHaveBeenCalledOnce()
  })

  it('serves a fresh cached value immediately and revalidates in the background', async () => {
    vi.useFakeTimers()

    const key = ['weekly'] as const
    const cachedValue = {
      source: 'cache',
      weekId: '2026-W17',
    }
    const freshValue = {
      source: 'network',
      weekId: '2026-W17',
    }
    const networkRequest = createDeferred<typeof freshValue>()
    const isStale = vi.fn().mockReturnValue(false)
    const cache = {
      get: vi.fn().mockResolvedValue(cachedValue),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn(() => networkRequest.promise),
      isStale,
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    // No timer advance: a fresh value must not wait out the grace period.
    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'refreshing' },
        source: 'cache',
        value: cachedValue,
      },
    })
    expect(isStale).toHaveBeenCalledWith(cachedValue)

    networkRequest.resolve(freshValue)

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'ok' },
        source: 'network',
        value: freshValue,
      },
    })
    await expect(iterator.next()).resolves.toMatchObject({
      done: true,
      value: undefined,
    })

    expect(cache.set).toHaveBeenCalledOnce()
    expect(cache.set).toHaveBeenCalledWith(key, freshValue)
  })

  it('holds a stale cached value for the grace period so the network can win', async () => {
    vi.useFakeTimers()

    const key = ['weekly'] as const
    const cachedValue = {
      source: 'cache',
      weekId: '2026-W16',
    }
    const freshValue = {
      source: 'network',
      weekId: '2026-W17',
    }
    const networkRequest = createDeferred<typeof freshValue>()
    const isStale = vi.fn().mockReturnValue(true)
    const cache = {
      get: vi.fn().mockResolvedValue(cachedValue),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn(() => networkRequest.promise),
      isStale,
      key,
      signal: new AbortController().signal,
      timeoutMs: 1000,
    })

    const firstValue = iterator.next()
    await vi.advanceTimersByTimeAsync(1000)
    await expect(firstValue).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'refreshing' },
        source: 'cache',
        value: cachedValue,
      },
    })
    expect(isStale).toHaveBeenCalledWith(cachedValue)

    networkRequest.resolve(freshValue)

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'ok' },
        source: 'network',
        value: freshValue,
      },
    })
    await expect(iterator.next()).resolves.toMatchObject({
      done: true,
      value: undefined,
    })
  })

  it('falls back to cache without a refresh error when the initial network request fails', async () => {
    const key = ['weekly'] as const
    const cachedValue = {
      source: 'cache',
      weekId: '2026-W17',
    }
    const networkError = new Error('offline')
    const cache = {
      get: vi.fn().mockResolvedValue(cachedValue),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn().mockRejectedValue(networkError),
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'ok' },
        source: 'cache',
        value: cachedValue,
      },
    })
    await expect(iterator.next()).resolves.toMatchObject({
      done: true,
      value: undefined,
    })

    expect(cache.set).not.toHaveBeenCalled()
  })

  it('keeps the cached initial fallback clean when the revalidation request fails', async () => {
    vi.useFakeTimers()

    const key = ['weekly'] as const
    const cachedValue = {
      source: 'cache',
      weekId: '2026-W17',
    }
    const networkError = new Error('offline')
    const networkRequest = createDeferred<never>()
    const cache = {
      get: vi.fn().mockResolvedValue(cachedValue),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn(() => networkRequest.promise),
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    const firstValue = iterator.next()
    await vi.advanceTimersByTimeAsync(150)
    await expect(firstValue).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'refreshing' },
        source: 'cache',
        value: cachedValue,
      },
    })

    networkRequest.reject(networkError)

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { status: 'ok' },
        source: 'cache',
        value: cachedValue,
      },
    })
    await expect(iterator.next()).resolves.toMatchObject({
      done: true,
      value: undefined,
    })

    expect(cache.set).not.toHaveBeenCalled()
  })

  it('throws when there is no cached value to fall back to', async () => {
    const key = ['weekly'] as const
    const networkError = new Error('offline')
    const cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn().mockRejectedValue(networkError),
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    await expect(iterator.next()).rejects.toBe(networkError)

    expect(cache.set).not.toHaveBeenCalled()
  })

  it('treats a rejected cache read as a miss when the network succeeds', async () => {
    const key = ['weekly'] as const
    const storageError = new Error('cache unavailable')
    const networkValue = { weekId: '2026-W17' }
    const networkRequest = createDeferred<typeof networkValue>()
    const cache = {
      get: vi.fn().mockRejectedValue(storageError),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const firstValue = streamCachedQuery({
      cache,
      fetcher: vi.fn(() => networkRequest.promise),
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    }).next()

    await Promise.resolve()
    networkRequest.resolve(networkValue)

    await expect(firstValue).resolves.toMatchObject({
      done: false,
      value: { refresh: { status: 'ok' }, source: 'network', value: networkValue },
    })
  })

  it('surfaces the network error when both the cache read and network request fail', async () => {
    const key = ['weekly'] as const
    const storageError = new Error('cache unavailable')
    const networkError = new Error('offline')
    const cache = {
      get: vi.fn().mockRejectedValue(storageError),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn().mockRejectedValue(networkError),
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    await expect(iterator.next()).rejects.toBe(networkError)
  })

  it('keeps the previous visible value when refresh fails', async () => {
    const key = ['weekly'] as const
    const previousValue = {
      source: 'network',
      weekId: '2026-W17',
    }
    const networkError = new Error('offline')
    const cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const iterator = streamCachedQuery({
      cache,
      fetcher: vi.fn().mockRejectedValue(networkError),
      key,
      previous: {
        key,
        refresh: { status: 'ok' },
        source: 'network',
        value: previousValue,
      },
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: {
        refresh: { error: networkError, status: 'failed' },
        source: 'network',
        value: previousValue,
      },
    })
    await expect(iterator.next()).resolves.toMatchObject({
      done: true,
      value: undefined,
    })

    expect(cache.get).not.toHaveBeenCalled()
    expect(cache.set).not.toHaveBeenCalled()
  })
})

describe('createCachedQuery', () => {
  it('shows a newer refresh while serializing slow writes in the background', async () => {
    const firstWrite = createDeferred<void>()
    const cache = {
      get: () => undefined,
      set: vi
        .fn()
        .mockImplementationOnce(() => firstWrite.promise)
        .mockResolvedValue(undefined),
    }
    const { result } = renderHook(() =>
      createCachedQuery({
        source: () => [] as const,
        fetcher: vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second'),
        cache,
        timeoutMs: 0,
      }),
    )

    await resolve(() => result.data)
    flush()
    expect(result.data).toBe('first')
    result.refresh()
    flush()
    await resolve(() => result.data)
    flush()
    expect(result.data).toBe('second')
    expect(result.pending).toBe(false)
    expect(cache.set).toHaveBeenCalledExactlyOnceWith([], 'first')

    firstWrite.resolve()
    await vi.waitFor(() => expect(cache.set).toHaveBeenLastCalledWith([], 'second'))
  })

  it('continues persisting later refreshes after a write fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const cache = {
      get: () => undefined,
      set: vi.fn().mockRejectedValueOnce(new Error('quota')).mockResolvedValue(undefined),
    }
    const { result } = renderHook(() =>
      createCachedQuery({
        source: () => [] as const,
        fetcher: vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second'),
        cache,
        timeoutMs: 0,
      }),
    )

    await resolve(() => result.data)
    flush()
    result.refresh()
    flush()
    await resolve(() => result.data)
    flush()
    expect(result.data).toBe('second')
    await vi.waitFor(() => expect(cache.set).toHaveBeenLastCalledWith([], 'second'))
  })

  it('exposes the resolved value, its source, and a settled pending state', async () => {
    const key = ['weekly'] as const
    const networkValue = { weekId: '2026-W17' }
    const cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const { result } = renderHook(() =>
      createCachedQuery({
        source: () => key,
        fetcher: vi.fn().mockResolvedValue(networkValue),
        cache,
        timeoutMs: 50,
      }),
    )

    await resolve(() => result.data)
    flush()

    expect(result.data).toEqual(networkValue)
    expect(result.source).toBe('network')
    expect(result.pending).toBe(false)
    expect(result.lastRefreshError).toBeNull()
  })

  it('surfaces a refresh error without losing the previously visible value', async () => {
    const key = ['weekly'] as const
    const networkValue = { weekId: '2026-W17' }
    const cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    }
    const fetcher = vi.fn().mockResolvedValueOnce(networkValue)

    const { result } = renderHook(() =>
      createCachedQuery({
        source: () => key,
        fetcher,
        cache,
        timeoutMs: 50,
      }),
    )

    await resolve(() => result.data)
    flush()
    expect(result.lastRefreshError).toBeNull()

    const refreshError = new Error('offline')
    fetcher.mockRejectedValueOnce(refreshError)
    result.refresh()
    flush()
    await resolve(() => result.data)
    flush()

    expect(result.data).toEqual(networkValue)
    expect(result.lastRefreshError).toBe(refreshError)
  })

  it('reports pending while revalidating a stale cached value, then settles', async () => {
    vi.useFakeTimers()

    const cachedValue = { weekId: 'cached' }
    const networkValue = { weekId: 'network' }
    const network = createDeferred<typeof networkValue>()
    const cache = {
      get: vi.fn().mockResolvedValue(cachedValue),
      set: vi.fn().mockResolvedValue(undefined),
    }

    const { result } = renderHook(() =>
      createCachedQuery({
        source: () => ['weekly'] as const,
        fetcher: vi.fn(() => network.promise),
        isStale: () => true,
        cache,
        timeoutMs: 1000,
      }),
    )

    // Past the grace period the stale cache is served while the network is
    // still in flight: the value is visible, sourced from cache, and the
    // pending indicator is on.
    await vi.advanceTimersByTimeAsync(1000)
    flush()
    expect(result.data).toEqual(cachedValue)
    expect(result.source).toBe('cache')
    expect(result.pending).toBe(true)

    network.resolve(networkValue)
    await vi.advanceTimersByTimeAsync(0)
    flush()

    expect(result.data).toEqual(networkValue)
    expect(result.source).toBe('network')
    expect(result.pending).toBe(false)
  })

  it('refetches when the source key changes', async () => {
    const cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    }
    const fetcher = vi.fn().mockResolvedValueOnce({ weekId: 'first' }).mockResolvedValueOnce({ weekId: 'second' })
    const [weekId, setWeekId] = createSignal('first')

    const { result } = renderHook(() =>
      createCachedQuery({
        source: () => [weekId()] as const,
        fetcher,
        cache,
        timeoutMs: 50,
      }),
    )

    await resolve(() => result.data)
    flush()
    expect(result.data).toEqual({ weekId: 'first' })

    setWeekId('second')
    flush()
    await resolve(() => result.data)
    flush()

    expect(result.data).toEqual({ weekId: 'second' })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})

describe('isSameKey', () => {
  it('treats structurally equal keys as the same regardless of array identity', () => {
    expect(isSameKey(['weekly', '2026-W17'], ['weekly', '2026-W17'])).toBe(true)
  })

  it('treats keys with a differing element as different', () => {
    expect(isSameKey(['weekly', '2026-W17'], ['weekly', '2026-W18'])).toBe(false)
  })

  it('treats a key prefix as a different key', () => {
    expect(isSameKey(['weekly'], ['weekly', '2026-W17'])).toBe(false)
    expect(isSameKey(['weekly', '2026-W17'], ['weekly'])).toBe(false)
  })

  it('compares elements with Object.is semantics', () => {
    expect(isSameKey([Number.NaN], [Number.NaN])).toBe(true)
    expect(isSameKey([0], [-0])).toBe(false)
  })
})

function createDeferred<T>() {
  let reject!: (reason?: unknown) => void
  let resolve!: (value: T | PromiseLike<T>) => void

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return {
    promise,
    reject,
    resolve,
  }
}
