// The CDN cache vocabulary has one home: routes mint these headers, the
// contract middleware strips them from responses that must never be cached.
// Any new CDN header constant must also be added to CDN_CACHE_HEADERS so the
// strip covers it.
export const VERCEL_CDN_CACHE_CONTROL_HEADER = 'vercel-cdn-cache-control'
export const VERCEL_CACHE_TAG_HEADER = 'vercel-cache-tag'
const CDN_CACHE_CONTROL_HEADER = 'cdn-cache-control'

const CDN_CACHE_HEADERS = [VERCEL_CDN_CACHE_CONTROL_HEADER, VERCEL_CACHE_TAG_HEADER, CDN_CACHE_CONTROL_HEADER]

// The CDN directives take priority over cache-control on Vercel, so making a
// response uncacheable means removing them, not just setting no-store.
export function stripCdnCacheHeaders(headers: Headers): void {
  for (const name of CDN_CACHE_HEADERS) headers.delete(name)
}
