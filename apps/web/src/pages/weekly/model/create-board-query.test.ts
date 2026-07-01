import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WeeklySnapshotResult } from '~/shared/api'
import type { CreateCachedQueryOptions } from '~/shared/lib/create-cached-query'
import { createBoardQuery } from './create-board-query'

// `createBoardQuery` is a thin wiring layer over `createCachedQuery`:
// the interesting reactive/async behavior (race, grace period, staleness)
// already lives in create-cached-query.test.ts. Here we only verify the
// wiring is correct — fetcher hits the weekly endpoint, cache reads/writes
// go through the shared client cache, `isStale` defers to `isWeeklyExpired`,
// and `equal` does a structural compare.
const { mockFetchWeeklySnapshot, mockReadCachedWeeklySnapshot, mockWriteCachedWeeklySnapshot, mockCreateCachedQuery } =
  vi.hoisted(() => ({
    mockFetchWeeklySnapshot: vi.fn(),
    mockReadCachedWeeklySnapshot: vi.fn(),
    mockWriteCachedWeeklySnapshot: vi.fn(),
    mockCreateCachedQuery: vi.fn(),
  }))

vi.mock('~/shared/api', () => ({
  fetchWeeklySnapshot: mockFetchWeeklySnapshot,
  readCachedWeeklySnapshot: mockReadCachedWeeklySnapshot,
  weeklySnapshotUrl: '/api/v1/weekly',
  writeCachedWeeklySnapshot: mockWriteCachedWeeklySnapshot,
}))

vi.mock('~/shared/lib/create-cached-query', () => ({
  createCachedQuery: mockCreateCachedQuery,
}))

afterEach(() => {
  vi.clearAllMocks()
})

function captureOptions(): CreateCachedQueryOptions<readonly [], WeeklySnapshotResult> {
  expect(mockCreateCachedQuery).toHaveBeenCalledOnce()
  return mockCreateCachedQuery.mock.calls[0][0]
}

function createSnapshot(expiration: string): WeeklySnapshotResult {
  return { week: { expiration } } as unknown as WeeklySnapshotResult
}

describe('createBoardQuery', () => {
  it('fetches from the weekly snapshot URL with the query signal', async () => {
    createBoardQuery()

    const options = captureOptions()
    const signal = new AbortController().signal
    const networkValue = createSnapshot('2026-07-01T00:00:00.000Z')
    mockFetchWeeklySnapshot.mockResolvedValue(networkValue)

    await options.fetcher([], { signal })

    expect(mockFetchWeeklySnapshot).toHaveBeenCalledWith({
      request: '/api/v1/weekly',
      signal,
    })
  })

  it('reads and writes through the shared weekly client cache', async () => {
    createBoardQuery()

    const options = captureOptions()
    const cachedValue = createSnapshot('2026-07-01T00:00:00.000Z')
    mockReadCachedWeeklySnapshot.mockResolvedValue(cachedValue)

    await expect(options.cache.get([])).resolves.toBe(cachedValue)
    expect(mockReadCachedWeeklySnapshot).toHaveBeenCalledWith('/api/v1/weekly')

    await options.cache.set([], cachedValue)
    expect(mockWriteCachedWeeklySnapshot).toHaveBeenCalledWith(cachedValue, '/api/v1/weekly')
  })

  it('treats a missing cached snapshot as undefined', async () => {
    createBoardQuery()

    const options = captureOptions()
    mockReadCachedWeeklySnapshot.mockResolvedValue(null)

    await expect(options.cache.get([])).resolves.toBeUndefined()
  })

  it('treats a snapshot as stale once its week has expired', async () => {
    createBoardQuery()

    const options = captureOptions()

    expect(options.isStale?.(createSnapshot('2000-01-01T00:00:00.000Z'))).toBe(true)
    expect(options.isStale?.(createSnapshot('2999-01-01T00:00:00.000Z'))).toBe(false)
  })

  it('treats structurally equal snapshots as equal even across distinct objects', async () => {
    createBoardQuery()

    const options = captureOptions()
    const a = createSnapshot('2026-07-01T00:00:00.000Z')
    const b = createSnapshot('2026-07-01T00:00:00.000Z')
    const c = createSnapshot('2026-07-08T00:00:00.000Z')

    expect(options.equal?.(a, a)).toBe(true)
    expect(options.equal?.(a, b)).toBe(true)
    expect(options.equal?.(a, c)).toBe(false)
  })
})
