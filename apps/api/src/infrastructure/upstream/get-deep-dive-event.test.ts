import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import * as v from 'valibot'
import { getDeepDiveEvent } from './get-deep-dive-event.ts'

describe('getDeepDiveEvent', () => {
  it('maps the upstream payload and derives the release one week back', async () => {
    const fetchImpl: typeof fetch = async () =>
      jsonResponse({ SeedV2: 1234567890, ExpirationTime: '2026-07-02T11:00:00.000Z' })

    const event = await getDeepDiveEvent(fetchImpl)

    assert.deepEqual(event, {
      seed: 1234567890,
      release: '2026-06-25T11:00:00.000Z',
      expiration: '2026-07-02T11:00:00.000Z',
    })
  })

  it('throws on a non-ok response', async () => {
    const fetchImpl: typeof fetch = async () => new Response('nope', { status: 503 })

    await assert.rejects(getDeepDiveEvent(fetchImpl), /HTTP 503/)
  })

  it('rejects a payload that violates the upstream schema', async () => {
    const fetchImpl: typeof fetch = async () => jsonResponse({ SeedV2: -1, ExpirationTime: '2026-07-02T11:00:00.000Z' })

    await assert.rejects(getDeepDiveEvent(fetchImpl), v.ValiError)
  })

  it('rejects a payload missing required fields', async () => {
    const fetchImpl: typeof fetch = async () => jsonResponse({ SeedV2: 42 })

    await assert.rejects(getDeepDiveEvent(fetchImpl), v.ValiError)
  })
})

const jsonResponse = (body: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(body), { status: 200, ...init })
