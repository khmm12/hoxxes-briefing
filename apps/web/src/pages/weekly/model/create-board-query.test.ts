import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Briefing } from '~/shared/api'
import type { CreateCachedQueryOptions } from '~/shared/lib/create-cached-query'
import { createBoardQuery } from './create-board-query'

// `createBoardQuery` is a thin wiring layer over `createCachedQuery`:
// the interesting reactive/async behavior (race, grace period, staleness)
// already lives in create-cached-query.test.ts. Here we only verify the
// wiring is correct — fetcher hits the briefing endpoint, cache reads/writes
// go through the shared client cache, `isStale` defers to `isWeeklyExpired`,
// and `equal` does a structural compare.
const { mockFetchBriefing, mockReadCachedBriefing, mockCacheBriefing, mockCreateCachedQuery } = vi.hoisted(() => ({
  mockFetchBriefing: vi.fn(),
  mockReadCachedBriefing: vi.fn(),
  mockCacheBriefing: vi.fn(),
  mockCreateCachedQuery: vi.fn(),
}))

vi.mock('~/shared/api', () => ({
  fetchBriefing: mockFetchBriefing,
  readCachedBriefing: mockReadCachedBriefing,
  briefingUrl: '/api/v1/briefing',
  cacheBriefing: mockCacheBriefing,
}))

vi.mock('~/shared/lib/create-cached-query', () => ({
  createCachedQuery: mockCreateCachedQuery,
}))

afterEach(() => {
  vi.clearAllMocks()
})

function captureOptions(): CreateCachedQueryOptions<readonly [], Briefing> {
  expect(mockCreateCachedQuery).toHaveBeenCalledOnce()
  return mockCreateCachedQuery.mock.calls[0][0]
}

function createBriefing(expiration: string): Briefing {
  return { expiration } as unknown as Briefing
}

describe('createBoardQuery', () => {
  it('fetches from the briefing URL with the query signal', async () => {
    createBoardQuery()

    const options = captureOptions()
    const signal = new AbortController().signal
    const networkValue = createBriefing('2026-07-01T00:00:00.000Z')
    mockFetchBriefing.mockResolvedValue(networkValue)

    await options.fetcher([], { signal })

    expect(mockFetchBriefing).toHaveBeenCalledWith({
      request: '/api/v1/briefing',
      signal,
    })
  })

  it('reads and writes through the shared briefing client cache', async () => {
    createBoardQuery()

    const options = captureOptions()
    const cachedValue = createBriefing('2026-07-01T00:00:00.000Z')
    mockReadCachedBriefing.mockResolvedValue(cachedValue)

    await expect(options.cache.get([])).resolves.toBe(cachedValue)
    expect(mockReadCachedBriefing).toHaveBeenCalledWith('/api/v1/briefing')

    await options.cache.set([], cachedValue)
    expect(mockCacheBriefing).toHaveBeenCalledWith(cachedValue, '/api/v1/briefing')
  })

  it('treats a missing cached briefing as undefined', async () => {
    createBoardQuery()

    const options = captureOptions()
    mockReadCachedBriefing.mockResolvedValue(null)

    await expect(options.cache.get([])).resolves.toBeUndefined()
  })

  it('treats a briefing as stale once it has expired', async () => {
    createBoardQuery()

    const options = captureOptions()

    expect(options.isStale?.(createBriefing('2000-01-01T00:00:00.000Z'))).toBe(true)
    expect(options.isStale?.(createBriefing('2999-01-01T00:00:00.000Z'))).toBe(false)
  })

  it('treats structurally equal briefings as equal even across distinct objects', async () => {
    createBoardQuery()

    const options = captureOptions()
    const a = createBriefing('2026-07-01T00:00:00.000Z')
    const b = createBriefing('2026-07-01T00:00:00.000Z')
    const c = createBriefing('2026-07-08T00:00:00.000Z')

    expect(options.equal?.(a, a)).toBe(true)
    expect(options.equal?.(a, b)).toBe(true)
    expect(options.equal?.(a, c)).toBe(false)
  })
})
