// CLEANUP(stage-4): covers weekly-cache-headers.ts — deletes with the legacy wire.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createWeeklySuccessCacheHeaders, weeklyBrowserCacheControl } from './cache-headers.ts'

describe('createWeeklySuccessCacheHeaders', () => {
  it('sets Vercel CDN max-age until expiration minus safety margin', () => {
    const headers = createWeeklySuccessCacheHeaders('2026-04-23T11:00:00.000Z', new Date('2026-04-23T10:00:00.000Z'))

    assert.equal(headers['Cache-Control'], weeklyBrowserCacheControl)
    assert.equal(headers['Vercel-Cache-Tag'], 'weekly,weekly-v1')
    assert.equal(headers['Vercel-CDN-Cache-Control'], 'public, max-age=3540, stale-while-revalidate=60')
  })

  it('disables Vercel CDN cache when expiration is inside safety margin', () => {
    const headers = createWeeklySuccessCacheHeaders('2026-04-23T11:00:00.000Z', new Date('2026-04-23T10:59:30.000Z'))

    assert.equal(headers['Cache-Control'], weeklyBrowserCacheControl)
    assert.equal(headers['Vercel-Cache-Tag'], 'weekly,weekly-v1')
    assert.equal(headers['Vercel-CDN-Cache-Control'], 'no-store')
  })
})
