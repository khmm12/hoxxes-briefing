import {
  fetchWeeklySnapshot,
  readCachedWeeklySnapshot,
  type WeeklySnapshotResult,
  weeklySnapshotUrl,
  writeCachedWeeklySnapshot,
} from '~/shared/api'
import { type CachedQuery, createCachedQuery } from '~/shared/lib/create-cached-query'
import { isWeeklyExpired } from './weekly-page-state'

// A fresh (non-expired) snapshot is served from cache instantly; only a stale
// one is worth holding the UI for while the network races.
const staleWeeklySnapshotGracePeriodMs = 1000

export function createBoardQuery(): CachedQuery<WeeklySnapshotResult> {
  return createCachedQuery({
    source: () => [] as const,
    fetcher: (_, ctx) =>
      fetchWeeklySnapshot({
        request: weeklySnapshotUrl,
        signal: ctx.signal,
      }),
    cache: {
      async get(_) {
        const cachedSnapshot = await readCachedWeeklySnapshot(weeklySnapshotUrl)
        if (cachedSnapshot == null) return undefined
        return cachedSnapshot
      },
      async set(_, snapshot) {
        await writeCachedWeeklySnapshot(snapshot, weeklySnapshotUrl)
      },
    },
    equal(l, r) {
      return Object.is(l, r) || JSON.stringify(l) === JSON.stringify(r)
    },
    isStale(snapshot) {
      return isWeeklyExpired(new Date(snapshot.week.expiration), new Date())
    },
    timeoutMs: staleWeeklySnapshotGracePeriodMs,
  })
}
