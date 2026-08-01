import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import * as v from 'valibot'
import { getDeepDiveEvent } from './get-deep-dive-event.ts'

describe('getDeepDiveEvent', () => {
  it('bounds the upstream request with an abort signal', async () => {
    let requestSignal: AbortSignal | undefined
    const fetchImpl: typeof fetch = async (_input, init) => {
      requestSignal = init?.signal ?? undefined
      return jsonResponse({ SeedV2: 1234567890, ExpirationTime: '2026-07-02T11:00:00.000Z' })
    }

    await getDeepDiveEvent(fetchImpl, 1)

    const signal = requestSignal
    assert.ok(signal)
    if (!signal.aborted) {
      await new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true })
      })
    }
    assert.equal(signal.aborted, true)
    assert.equal(signal.reason?.name, 'TimeoutError')
  })

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
