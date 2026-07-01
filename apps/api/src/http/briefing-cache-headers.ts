import { differenceInSeconds } from 'date-fns/differenceInSeconds'

const BRIEFING_CDN_CACHE_SAFETY_MARGIN_SECONDS = 60
const BRIEFING_CDN_STALE_WHILE_REVALIDATE_SECONDS = 60
const BRIEFING_CACHE_TAG = 'briefing,briefing-v1'

export const briefingBrowserCacheControl = 'public, max-age=0, must-revalidate'
export const briefingNoStoreCacheControl = 'no-store'

export type BriefingCacheHeaders = Record<string, string>

export function createBriefingSuccessCacheHeaders(expiration: string, now: Date = new Date()): BriefingCacheHeaders {
  const ttlSeconds = getTTLSeconds(expiration, now)

  return {
    'Cache-Control': briefingBrowserCacheControl,
    'Vercel-Cache-Tag': BRIEFING_CACHE_TAG,
    'Vercel-CDN-Cache-Control':
      ttlSeconds > 0
        ? [
            'public',
            `max-age=${ttlSeconds}`,
            `stale-while-revalidate=${BRIEFING_CDN_STALE_WHILE_REVALIDATE_SECONDS}`,
          ].join(', ')
        : 'no-store',
  }
}

export function createBriefingErrorCacheHeaders(): BriefingCacheHeaders {
  return {
    'Cache-Control': briefingNoStoreCacheControl,
  }
}

function getTTLSeconds(expiration: string, now: Date): number {
  return differenceInSeconds(expiration, now, { roundingMethod: 'floor' }) - BRIEFING_CDN_CACHE_SAFETY_MARGIN_SECONDS
}
