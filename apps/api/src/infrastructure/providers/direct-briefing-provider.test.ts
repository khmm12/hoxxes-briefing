import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BriefingProviderError } from '../../ports/briefing-provider.ts'
import { type GeneratedBriefing, generateBriefing } from '../generator/generator-bridge.ts'
import type { DeepDiveEvent } from '../upstream/get-deep-dive-event.ts'
import { createDirectBriefingProvider } from './direct-briefing-provider.ts'

describe('createDirectBriefingProvider', () => {
  it('falls back to the real upstream and generator by default', () => {
    const provider = createDirectBriefingProvider()

    assert.equal(typeof provider.getBriefing, 'function')
  })

  it('composes the upstream event with the generated dives', async () => {
    const provider = createDirectBriefingProvider({
      loadEvent: async () => event,
      generateFromSeed: () => generated,
    })

    const briefing = await provider.getBriefing()

    assert.deepEqual(briefing, {
      seed: event.seed,
      release: event.release,
      expiration: event.expiration,
      dives: generated.dives,
    })
  })

  it('wraps an upstream failure as UPSTREAM_UNAVAILABLE', async (t) => {
    t.mock.method(console, 'error', () => {})
    const cause = new Error('network down')
    const provider = createDirectBriefingProvider({
      loadEvent: async () => {
        throw cause
      },
      generateFromSeed: () => generated,
    })

    const error = await rejection(provider.getBriefing())

    assert.ok(error instanceof BriefingProviderError)
    assert.equal(error.kind, 'UPSTREAM_UNAVAILABLE')
    assert.equal(error.cause, cause)
  })

  it('omits the cause option when nothing was thrown as the cause', async (t) => {
    t.mock.method(console, 'error', () => {})
    const provider = createDirectBriefingProvider({
      loadEvent: async () => {
        throw undefined
      },
      generateFromSeed: () => generated,
    })

    const error = await rejection(provider.getBriefing())

    assert.ok(error instanceof BriefingProviderError)
    assert.equal(error.kind, 'UPSTREAM_UNAVAILABLE')
    assert.equal(error.cause, undefined)
  })

  it('wraps a generator failure as GENERATOR_UNAVAILABLE', async () => {
    const cause = new Error('wasm exploded')
    const provider = createDirectBriefingProvider({
      loadEvent: async () => event,
      generateFromSeed: () => {
        throw cause
      },
    })

    const error = await rejection(provider.getBriefing())

    assert.ok(error instanceof BriefingProviderError)
    assert.equal(error.kind, 'GENERATOR_UNAVAILABLE')
    assert.equal(error.cause, cause)
  })

  it('rejects a seed mismatch as GENERATOR_UNAVAILABLE', async () => {
    const provider = createDirectBriefingProvider({
      loadEvent: async () => event,
      generateFromSeed: () => ({ seed: SEED + 1, dives: generated.dives }),
    })

    const error = await rejection(provider.getBriefing())

    assert.ok(error instanceof BriefingProviderError)
    assert.equal(error.kind, 'GENERATOR_UNAVAILABLE')
    assert.match(error.message, /seed mismatch/i)
  })
})

const SEED = 1234567890

const event: DeepDiveEvent = {
  seed: SEED,
  release: '2026-06-25T11:00:00.000Z',
  expiration: '2026-07-02T11:00:00.000Z',
}

// Reuse the real (deterministic) generator output as a valid dives fixture; the
// provider only forwards `generated.dives`, it does not inspect their shape.
const generated: GeneratedBriefing = { seed: SEED, dives: generateBriefing(SEED).dives }

const rejection = (promise: Promise<unknown>): Promise<unknown> =>
  promise.then(
    () => assert.fail('expected the promise to reject'),
    (error: unknown) => error,
  )
