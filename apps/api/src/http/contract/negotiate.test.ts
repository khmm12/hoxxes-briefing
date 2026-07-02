import assert from 'node:assert/strict'
import test from 'node:test'
import { Hono } from 'hono'
import { BRIEFING_CONTRACT_HEADER, v1 } from '@hoxxes-briefing/contracts'
import { type ContractNegotiationDependencies, createContractNegotiation } from './negotiate.ts'

const createTestApp = (overrides: Partial<ContractNegotiationDependencies> = {}) => {
  const app = new Hono()

  app.get(
    '/briefing',
    createContractNegotiation({
      currentRev: 3,
      minSupportedRev: 2,
      downgrades: { 3: (payload) => payload },
      ...overrides,
    }),
    (context) => {
      context.header('cache-control', 'public, max-age=60')
      context.header('vercel-cdn-cache-control', 'public, max-age=600')
      context.header('vercel-cache-tag', 'briefing')
      return context.json({ rev: 3 })
    },
  )

  return app
}

test('echoes the current revision on every response', async () => {
  const app = createTestApp()

  const response = await app.request('/briefing', { headers: { [BRIEFING_CONTRACT_HEADER]: '3' } })

  assert.equal(response.headers.get(BRIEFING_CONTRACT_HEADER), '3')
})

test('varies the CDN cache key by the client revision on every response', async () => {
  const app = createTestApp({ downgrades: { 3: (payload) => payload } })

  for (const headers of [
    {},
    { [BRIEFING_CONTRACT_HEADER]: '3' },
    { [BRIEFING_CONTRACT_HEADER]: '2' },
    { [BRIEFING_CONTRACT_HEADER]: '1' },
  ]) {
    const response = await app.request('/briefing', { headers })

    assert.equal(response.headers.get('vary'), BRIEFING_CONTRACT_HEADER)
  }
})

test('serves the current shape when no revision header is sent', async () => {
  const app = createTestApp()

  const response = await app.request('/briefing')

  assert.equal(response.status, 200)
  assert.equal(response.headers.get(BRIEFING_CONTRACT_HEADER), '3')
  assert.equal(response.headers.get('cache-control'), 'public, max-age=60')
  assert.equal(response.headers.get('vercel-cdn-cache-control'), 'public, max-age=600')
  assert.deepEqual(await response.json(), { rev: 3 })
})

test('serves the current shape to a future revision as-is', async () => {
  const app = createTestApp()

  const response = await app.request('/briefing', { headers: { [BRIEFING_CONTRACT_HEADER]: '4' } })

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'public, max-age=60')
  assert.deepEqual(await response.json(), { rev: 3 })
})

test('treats an unparseable revision header as absent', async () => {
  const app = createTestApp()

  // The empty string is the important case: `Number('')` is 0, which would
  // read as a retired revision and wall a healthy client.
  for (const header of ['banana', '', '1e2']) {
    const response = await app.request('/briefing', { headers: { [BRIEFING_CONTRACT_HEADER]: header } })

    assert.equal(response.status, 200, `header: ${JSON.stringify(header)}`)
    assert.deepEqual(await response.json(), { rev: 3 })
  }
})

test('downgrades a window revision through the composed chain and disables caching', async () => {
  const app = createTestApp({
    downgrades: {
      3: (payload) => ({ ...(payload as Record<string, unknown>), rev: 2 }),
    },
  })

  const response = await app.request('/briefing', { headers: { [BRIEFING_CONTRACT_HEADER]: '2' } })

  assert.equal(response.status, 200)
  assert.equal(response.headers.get(BRIEFING_CONTRACT_HEADER), '3')
  assert.equal(response.headers.get('cache-control'), 'no-store')
  // The CDN directives outrank cache-control on Vercel — a cached downgrade
  // would leak to current-revision clients.
  assert.equal(response.headers.get('vercel-cdn-cache-control'), null)
  assert.equal(response.headers.get('vercel-cache-tag'), null)
  assert.deepEqual(await response.json(), { rev: 2 })
})

test('composes multiple downgrade steps down to the client revision', async () => {
  const app = createTestApp({
    minSupportedRev: 1,
    downgrades: {
      3: (payload) => ({ ...(payload as Record<string, unknown>), rev: 2 }),
      2: (payload) => ({ ...(payload as Record<string, unknown>), rev: 1 }),
    },
  })

  const response = await app.request('/briefing', { headers: { [BRIEFING_CONTRACT_HEADER]: '1' } })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { rev: 1 })
})

test('leaves window error responses untouched apart from cache-control', async () => {
  const app = new Hono()
  app.get(
    '/briefing',
    createContractNegotiation({ currentRev: 3, minSupportedRev: 2, downgrades: { 3: () => ({}) } }),
    (context) => context.json({ code: 'INTERNAL_ERROR', message: 'boom' }, 500),
  )

  const response = await app.request('/briefing', { headers: { [BRIEFING_CONTRACT_HEADER]: '2' } })

  assert.equal(response.status, 500)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await response.json(), { code: 'INTERNAL_ERROR', message: 'boom' })
})

test('returns 410 CONTRACT_RETIRED below the supported window', async () => {
  const app = createTestApp()

  const response = await app.request('/briefing', {
    headers: { [BRIEFING_CONTRACT_HEADER]: '1', 'x-request-id': 'req-410' },
  })

  assert.equal(response.status, 410)
  assert.equal(response.headers.get(BRIEFING_CONTRACT_HEADER), '3')
  assert.equal(response.headers.get('cache-control'), 'no-store')

  const payload = v1.parseErrorResponse(await response.json())
  assert.equal(payload.code, 'CONTRACT_RETIRED')
  assert.equal(payload.requestId, 'req-410')
})

test('refuses to boot when a window revision has no downgrade', () => {
  assert.throws(
    () => createContractNegotiation({ currentRev: 3, minSupportedRev: 2, downgrades: {} }),
    /Missing contract downgrade for revision 3/,
  )
})

test('refuses to boot when the supported floor exceeds the current revision', () => {
  assert.throws(
    () => createContractNegotiation({ currentRev: 1, minSupportedRev: 2, downgrades: {} }),
    /MIN_SUPPORTED_REV 2 exceeds CONTRACT_REV 1/,
  )
})
