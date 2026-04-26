import {
  fetchWeeklySnapshot,
  readCachedWeeklySnapshot,
  type WeeklySnapshotResult,
  weeklySnapshotUrl,
  writeCachedWeeklySnapshot,
} from '~/shared/api/weekly'
import { type CachedQuery, createCachedQuery } from '~/shared/lib/create-cached-query'

export const defaultWeeklySnapshotGracePeriodMs = 150

export function createWeeklyBoardQuery(): CachedQuery<WeeklySnapshotResult> {
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
    timeoutMs: defaultWeeklySnapshotGracePeriodMs,
  })
}
