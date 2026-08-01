import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import { appDeps, createApp, readBriefingConfidence } from '../src/app.ts'
import type { Briefing } from '../src/application/models/briefing.ts'
import { type BriefingProvider, BriefingProviderError } from '../src/ports/briefing-provider.ts'

describe('GET /api/v1/briefing', () => {
  it('returns the clean briefing contract payload', async () => {
    const app = createAppWith(async () => createBriefing())

    const response = await app.request('/api/v1/briefing')

    assert.equal(response.status, 200)

    const rawPayload = await response.json()
    assert.equal(typeof rawPayload, 'object')
    assert.notEqual(rawPayload, null)
    // Flattened timing: no `week` envelope, no ISO-week `id`.
    assert.equal(Object.hasOwn(rawPayload as Record<string, unknown>, 'week'), false)

    const payload = v1.parseBriefingResponse(rawPayload)
    assert.equal(payload.seed, 1234567890)
    assert.equal(payload.confidence, 'verified')
    assert.equal(payload.release, '2026-04-16T11:00:00.000Z')
    assert.equal(payload.expiration, '2026-04-23T11:00:00.000Z')
    assert.equal(payload.dives.normal.name, 'Crystalline Corridors')

    // Clean domain vocabulary, emitted verbatim (domain == wire).
    const [first, second, third] = payload.dives.normal.missions
    assert.deepEqual(first.primaryObjective, { kind: 'Elimination', dreadnoughts: ['Classic', 'Twins'] })
    assert.equal(first.anomaly, 'LowGravity')
    assert.deepEqual(second.secondaryObjective, { kind: 'HeavyExtraction', resiniteMasses: 3 })
    assert.deepEqual(third.secondaryObjective, { kind: 'Elimination', dreadnoughts: ['Classic'] })
  })

  it('returns CDN cache headers for a fresh payload', async () => {
    const app = createAppWith(async () => withFutureWindow(createBriefing()))

    const response = await app.request('/api/v1/briefing')

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate')
    assert.equal(response.headers.get('vercel-cache-tag'), 'briefing,briefing-v1')
    assert.match(
      response.headers.get('vercel-cdn-cache-control') ?? '',
      /^public, max-age=\d+, stale-while-revalidate=60$/,
    )
  })

  it('maps an upstream failure to the shared error contract', async () => {
    const app = createAppWith(async () => {
      throw new BriefingProviderError('UPSTREAM_UNAVAILABLE', 'boom')
    })

    const response = await app.request('/api/v1/briefing', { headers: { 'x-request-id': 'req-123' } })

    assert.equal(response.status, 502)
    assert.equal(response.headers.get('cache-control'), 'no-store')

    const payload = v1.parseErrorResponse(await response.json())
    assert.equal(payload.code, 'UPSTREAM_UNAVAILABLE')
    assert.equal(payload.requestId, 'req-123')
  })

  it('presents a generator failure with the clean wire code', async () => {
    const app = createAppWith(async () => {
      throw new BriefingProviderError('GENERATOR_UNAVAILABLE', 'boom')
    })

    const response = await app.request('/api/v1/briefing')

    assert.equal(response.status, 503)
    const payload = v1.parseErrorResponse(await response.json())
    assert.equal(payload.code, 'BRIEFING_DATA_UNAVAILABLE')
  })

  it('rejects an invalid payload before it reaches the wire', async () => {
    const app = createAppWith(async () => invalidBriefing())

    const response = await app.request('/api/v1/briefing')

    assert.equal(response.status, 500)
    const payload = v1.parseErrorResponse(await response.json())
    assert.equal(payload.code, 'INVALID_RESPONSE_PAYLOAD')
  })

  it('presents an unexpected error as a generic internal error', async () => {
    const app = createAppWith(async () => {
      throw new Error('boom')
    })

    const response = await app.request('/api/v1/briefing')

    assert.equal(response.status, 500)
    const payload = v1.parseErrorResponse(await response.json())
    assert.equal(payload.code, 'INTERNAL_ERROR')
  })

  it('echoes the current contract revision', async () => {
    const app = createAppWith(async () => createBriefing())

    const response = await app.request('/api/v1/briefing', {
      headers: { [v1.BRIEFING_CONTRACT_HEADER]: String(v1.CONTRACT_REV) },
    })

    assert.equal(response.status, 200)
    assert.equal(response.headers.get(v1.BRIEFING_CONTRACT_HEADER), String(v1.CONTRACT_REV))
  })

  it('serves the current shape to header-less clients', async () => {
    const app = createAppWith(async () => createBriefing())

    const response = await app.request('/api/v1/briefing')

    assert.equal(response.status, 200)
    assert.equal(response.headers.get(v1.BRIEFING_CONTRACT_HEADER), String(v1.CONTRACT_REV))
    v1.parseBriefingResponse(await response.json())
  })

  it('stamps confidence from the composition-root flag', async () => {
    const app = createAppWith(async () => createBriefing(), 'unverified')

    const response = await app.request('/api/v1/briefing')

    assert.equal(response.status, 200)
    const payload = v1.parseBriefingResponse(await response.json())
    assert.equal(payload.confidence, 'unverified')
  })
})

describe('retired legacy route', () => {
  it('does not register /api/v1/weekly', async () => {
    const app = createAppWith(async () => createBriefing())

    const response = await app.request('/api/v1/weekly')

    assert.equal(response.status, 404)
  })
})

describe('readBriefingConfidence', () => {
  it('defaults to verified and rejects unknown values', () => {
    assert.equal(readBriefingConfidence(undefined), 'verified')
    assert.equal(readBriefingConfidence('verified'), 'verified')
    assert.equal(readBriefingConfidence('unverified'), 'unverified')
    assert.throws(() => readBriefingConfidence('unverfied'))
  })
})

describe('appDeps', () => {
  it('reads the confidence flag from the environment and wires the default provider', (t) => {
    const previous = process.env.BRIEFING_CONFIDENCE
    t.after(() => {
      if (previous === undefined) delete process.env.BRIEFING_CONFIDENCE
      else process.env.BRIEFING_CONFIDENCE = previous
    })
    process.env.BRIEFING_CONFIDENCE = 'unverified'

    const deps = appDeps()

    assert.equal(deps.confidence, 'unverified')
    assert.equal(typeof deps.briefingProvider.getBriefing, 'function')
  })
})

const createBriefing = (): Briefing => {
  return {
    seed: 1234567890,
    release: '2026-04-16T11:00:00.000Z',
    expiration: '2026-04-23T11:00:00.000Z',
    dives: {
      normal: {
        name: 'Crystalline Corridors',
        biome: 'AzureWeald',
        missions: [
          {
            primaryObjective: { kind: 'Elimination', dreadnoughts: ['Classic', 'Twins'] },
            secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 },
            anomaly: 'LowGravity',
            warning: null,
          },
          {
            primaryObjective: { kind: 'DeepScan', resonanceCrystals: 5 },
            secondaryObjective: { kind: 'HeavyExtraction', resiniteMasses: 3 },
            anomaly: null,
            warning: 'RegenerativeBugs',
          },
          {
            primaryObjective: { kind: 'MiningExpedition', morkite: 250 },
            secondaryObjective: { kind: 'Elimination', dreadnoughts: ['Classic'] },
            anomaly: 'RichAtmosphere',
            warning: null,
          },
        ],
      },
      elite: {
        name: 'Lethal Depths',
        biome: 'HollowBough',
        missions: [
          {
            primaryObjective: { kind: 'DeepScan', resonanceCrystals: 3 },
            secondaryObjective: { kind: 'EggHunt', eggs: 2 },
            anomaly: null,
            warning: null,
          },
          {
            primaryObjective: { kind: 'DeepScan', resonanceCrystals: 3 },
            secondaryObjective: { kind: 'EggHunt', eggs: 2 },
            anomaly: 'CriticalWeakness',
            warning: null,
          },
          {
            primaryObjective: { kind: 'DeepScan', resonanceCrystals: 3 },
            secondaryObjective: { kind: 'EggHunt', eggs: 2 },
            anomaly: null,
            warning: 'EliteThreat',
          },
        ],
      },
    },
  }
}

const withFutureWindow = (briefing: Briefing): Briefing => ({
  ...briefing,
  release: '2999-04-16T11:00:00.000Z',
  expiration: '2999-04-23T11:00:00.000Z',
})

const createProvider = (implementation: BriefingProvider['getBriefing']): BriefingProvider => {
  return {
    getBriefing: implementation,
  }
}

const createAppWith = (
  implementation: BriefingProvider['getBriefing'],
  confidence: v1.BriefingConfidence = 'verified',
) => createApp({ briefingProvider: createProvider(implementation), confidence })

function invalidBriefing(): Briefing {
  const briefing = createBriefing()

  return {
    ...briefing,
    dives: {
      ...briefing.dives,
      normal: {
        ...briefing.dives.normal,
        missions: [briefing.dives.normal.missions[0]],
      },
    },
  } as unknown as Briefing
}
