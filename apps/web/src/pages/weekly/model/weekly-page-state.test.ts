import { describe, expect, it } from 'vitest'
import {
  deriveWeeklyBoardState,
  resolveBoardStatus,
  resolveEmptyBoardState,
} from '~/pages/weekly/model/weekly-page-state'

const now = new Date('2026-04-20T12:00:00.000Z')
const futureExpiration = '2026-04-23T11:00:00.000Z'
const pastExpiration = '2026-04-16T11:00:00.000Z'

describe('deriveWeeklyBoardState', () => {
  it('marks current network data as live and refreshable', () => {
    expect(
      deriveWeeklyBoardState({
        expiration: futureExpiration,
        now,
        online: true,
        pending: false,
        isRefreshFailed: false,
        source: 'network',
      }),
    ).toEqual({
      canRefresh: true,
      commandSlot: 'refresh',
      freshness: 'live',
      isExpired: false,
      isRefreshFailed: false,
    })
  })

  it('marks online cached data as saved and keeps refresh available', () => {
    expect(
      deriveWeeklyBoardState({
        expiration: futureExpiration,
        now,
        online: true,
        pending: false,
        isRefreshFailed: false,
        source: 'cache',
      }),
    ).toMatchObject({
      canRefresh: true,
      commandSlot: 'refresh',
      freshness: 'cached',
    })
  })

  it('marks offline cached data as visible but not refreshable', () => {
    expect(
      deriveWeeklyBoardState({
        expiration: futureExpiration,
        now,
        online: false,
        pending: false,
        isRefreshFailed: false,
        source: 'cache',
      }),
    ).toMatchObject({
      canRefresh: false,
      commandSlot: 'offline',
      freshness: 'offline-cache',
    })
  })

  it('marks expired cached data as stale cache', () => {
    expect(
      deriveWeeklyBoardState({
        expiration: pastExpiration,
        now,
        online: true,
        pending: false,
        isRefreshFailed: false,
        source: 'cache',
      }),
    ).toMatchObject({
      freshness: 'stale-cache',
      isExpired: true,
    })
  })

  it('keeps visible board data while refresh is pending', () => {
    expect(
      deriveWeeklyBoardState({
        expiration: futureExpiration,
        now,
        online: true,
        pending: true,
        isRefreshFailed: false,
        source: 'network',
      }),
    ).toMatchObject({
      canRefresh: false,
      commandSlot: 'checking',
      freshness: 'live',
    })
  })
})

describe('resolveBoardStatus', () => {
  it.each([
    [{ freshness: 'live', commandSlot: 'checking', isRefreshFailed: false }, 'live-refreshing'],
    [{ freshness: 'live', commandSlot: 'refresh', isRefreshFailed: true }, 'live-refresh-failed'],
    [{ freshness: 'live', commandSlot: 'refresh', isRefreshFailed: false }, 'live'],
    [{ freshness: 'cached', commandSlot: 'checking', isRefreshFailed: false }, 'cached-refreshing'],
    [{ freshness: 'cached', commandSlot: 'refresh', isRefreshFailed: true }, 'cached-refresh-failed'],
    [{ freshness: 'cached', commandSlot: 'refresh', isRefreshFailed: false }, 'cached'],
    [{ freshness: 'offline-cache', commandSlot: 'offline', isRefreshFailed: false }, 'offline-cache'],
    [{ freshness: 'stale-cache', commandSlot: 'refresh', isRefreshFailed: true }, 'stale-cache-refresh-failed'],
    [{ freshness: 'stale-cache', commandSlot: 'refresh', isRefreshFailed: false }, 'stale-cache'],
  ] as const)('maps %o to %s', (state, status) => {
    expect(resolveBoardStatus(state)).toBe(status)
  })
})

describe('resolveEmptyBoardState', () => {
  it('uses fetch-empty online and offline-empty offline', () => {
    expect(resolveEmptyBoardState(true)).toBe('fetch-empty')
    expect(resolveEmptyBoardState(false)).toBe('offline-empty')
  })
})
