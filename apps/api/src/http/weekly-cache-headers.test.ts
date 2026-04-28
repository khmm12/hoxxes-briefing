import assert from 'node:assert/strict'
import test from 'node:test'
import { createWeeklySuccessCacheHeaders, weeklyBrowserCacheControl } from './weekly-cache-headers.ts'

test('createWeeklySuccessCacheHeaders sets Vercel CDN max-age until expiration minus safety margin', () => {
  const headers = createWeeklySuccessCacheHeaders('2026-04-23T11:00:00.000Z', new Date('2026-04-23T10:00:00.000Z'))

  assert.equal(headers['Cache-Control'], weeklyBrowserCacheControl)
  assert.equal(headers['Vercel-Cache-Tag'], 'weekly,weekly-v1')
  assert.equal(headers['Vercel-CDN-Cache-Control'], 'public, max-age=3540, stale-while-revalidate=60')
})

test('createWeeklySuccessCacheHeaders disables Vercel CDN cache when expiration is inside safety margin', () => {
  const headers = createWeeklySuccessCacheHeaders('2026-04-23T11:00:00.000Z', new Date('2026-04-23T10:59:30.000Z'))

  assert.equal(headers['Cache-Control'], weeklyBrowserCacheControl)
  assert.equal(headers['Vercel-Cache-Tag'], 'weekly,weekly-v1')
  assert.equal(headers['Vercel-CDN-Cache-Control'], 'no-store')
})
