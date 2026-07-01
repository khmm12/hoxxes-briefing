import { type Briefing, briefingUrl, cacheBriefing, fetchBriefing, readCachedBriefing } from '~/shared/api'
import { type CachedQuery, createCachedQuery } from '~/shared/lib/create-cached-query'
import { isBriefingExpired } from './briefing-page-state'

// A fresh (non-expired) briefing is served from cache instantly; only a stale
// one is worth holding the UI for while the network races.
const staleBriefingGracePeriodMs = 1000

export function createBoardQuery(): CachedQuery<Briefing> {
  return createCachedQuery({
    source: () => [] as const,
    fetcher: (_, ctx) =>
      fetchBriefing({
        request: briefingUrl,
        signal: ctx.signal,
      }),
    cache: {
      async get(_) {
        const cachedBriefing = await readCachedBriefing(briefingUrl)
        if (cachedBriefing == null) return undefined
        return cachedBriefing
      },
      async set(_, briefing) {
        await cacheBriefing(briefing, briefingUrl)
      },
    },
    equal(l, r) {
      return Object.is(l, r) || JSON.stringify(l) === JSON.stringify(r)
    },
    isStale(briefing) {
      return isBriefingExpired(new Date(briefing.expiration), new Date())
    },
    timeoutMs: staleBriefingGracePeriodMs,
  })
}
