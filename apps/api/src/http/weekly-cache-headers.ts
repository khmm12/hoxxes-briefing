import { differenceInSeconds } from 'date-fns/differenceInSeconds'

const WEEKLY_CDN_CACHE_SAFETY_MARGIN_SECONDS = 60
const WEEKLY_CDN_STALE_WHILE_REVALIDATE_SECONDS = 60
const WEEKLY_CACHE_TAG = 'weekly,weekly-v1'

export const weeklyBrowserCacheControl = 'public, max-age=0, must-revalidate'
export const weeklyNoStoreCacheControl = 'no-store'

export type WeeklyCacheHeaders = Record<string, string>

export function createWeeklySuccessCacheHeaders(expiration: string, now: Date = new Date()): WeeklyCacheHeaders {
  const ttlSeconds = getTTLSeconds(expiration, now)

  return {
    'Cache-Control': weeklyBrowserCacheControl,
    'Vercel-Cache-Tag': WEEKLY_CACHE_TAG,
    'Vercel-CDN-Cache-Control':
      ttlSeconds > 0
        ? [
            'public',
            `max-age=${ttlSeconds}`,
            `stale-while-revalidate=${WEEKLY_CDN_STALE_WHILE_REVALIDATE_SECONDS}`,
          ].join(', ')
        : 'no-store',
  }
}

export function createWeeklyErrorCacheHeaders(): WeeklyCacheHeaders {
  return {
    'Cache-Control': weeklyNoStoreCacheControl,
  }
}

function getTTLSeconds(expiration: string, now: Date): number {
  return differenceInSeconds(expiration, now, { roundingMethod: 'floor' }) - WEEKLY_CDN_CACHE_SAFETY_MARGIN_SECONDS
}
