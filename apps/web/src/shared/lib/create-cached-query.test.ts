import { afterEach, describe, expect, it, vi } from 'vitest'
import { streamCachedQuery } from './create-cached-query'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('streamCachedQuery', () => {
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
      equal: Object.is,
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
      equal: (left, right) => left.weekId === right.weekId,
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
      equal: Object.is,
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
      equal: Object.is,
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
      equal: Object.is,
      fetcher: vi.fn().mockRejectedValue(networkError),
      key,
      signal: new AbortController().signal,
      timeoutMs: 150,
    })

    await expect(iterator.next()).rejects.toBe(networkError)

    expect(cache.set).not.toHaveBeenCalled()
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
      equal: Object.is,
      fetcher: vi.fn().mockRejectedValue(networkError),
      key,
      previous: {
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
