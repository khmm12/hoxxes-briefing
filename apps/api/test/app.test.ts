import assert from 'node:assert/strict'
import test from 'node:test'

import { parseApiV1ErrorResponse, parseApiV1WeeklyResponse } from '@hoxxes-briefing/contracts/api/v1'
import { createApp } from '../src/app.ts'
import type { CurrentDeepDives } from '../src/application/models/currentDeepDives.ts'
import { type DeepDivesProvider, DeepDivesProviderError } from '../src/ports/deepDivesProvider.ts'

const createMission = (): CurrentDeepDives['dives']['normal']['missions'][number] => {
  return {
    primaryObjective: {
      kind: 'DeepScan',
      resonanceCrystals: 2,
    },
    secondaryObjective: {
      kind: 'Blackbox',
      blackBoxes: 1,
    },
    mutator: null,
    warning: 'RegenerativeBugs',
  }
}

const createCurrentDeepDives = (): CurrentDeepDives => {
  return {
    seed: 1234567890,
    release: '2026-04-16T11:00:00.000Z',
    expiration: '2026-04-23T11:00:00.000Z',
    dives: {
      normal: {
        name: 'Crystal Routes',
        biome: 'AzureWeald',
        missions: [
          createMission(),
          {
            ...createMission(),
            mutator: 'LowGravity',
            warning: null,
          },
          createMission(),
        ],
      },
      elite: {
        name: 'Lethal Depths',
        biome: 'HollowBough',
        missions: [
          createMission(),
          createMission(),
          {
            ...createMission(),
            mutator: 'RichAtmosphere',
          },
        ],
      },
    },
  }
}

const createProvider = (implementation: DeepDivesProvider['getCurrentDeepDives']): DeepDivesProvider => {
  return {
    getCurrentDeepDives: implementation,
  }
}

test('GET /api/v1/weekly returns the weekly contract payload', async () => {
  const app = createApp({
    deepDivesProvider: createProvider(async () => createCurrentDeepDives()),
  })

  const response = await app.request('/api/v1/weekly')

  assert.equal(response.status, 200)

  const rawPayload = await response.json()
  assert.equal(typeof rawPayload, 'object')
  assert.notEqual(rawPayload, null)
  assert.equal(Object.hasOwn(rawPayload as Record<string, unknown>, 'freshness'), false)

  const payload = parseApiV1WeeklyResponse(rawPayload)
  assert.equal(payload.week.id, '2026-W17')
  assert.equal(payload.week.seed, 1234567890)
  assert.equal(payload.dives.normal.name, 'Crystal Routes')
  assert.equal(payload.dives.elite.missions.length, 3)
})

test('GET /api/v1/weekly returns CDN cache headers for a fresh weekly payload', async () => {
  const app = createApp({
    deepDivesProvider: createProvider(async () => ({
      ...createCurrentDeepDives(),
      release: '2999-04-16T11:00:00.000Z',
      expiration: '2999-04-23T11:00:00.000Z',
    })),
  })

  const response = await app.request('/api/v1/weekly')

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate')
  assert.equal(response.headers.get('vercel-cache-tag'), 'weekly,weekly-v1')
  assert.match(
    response.headers.get('vercel-cdn-cache-control') ?? '',
    /^public, max-age=\d+, stale-while-revalidate=60$/,
  )
})

test('GET /api/v1/weekly returns a structured upstream failure', async () => {
  const app = createApp({
    deepDivesProvider: createProvider(async () => {
      throw new DeepDivesProviderError('UPSTREAM_UNAVAILABLE', 'boom')
    }),
  })

  const response = await app.request('/api/v1/weekly', {
    headers: {
      'x-request-id': 'req-123',
    },
  })

  assert.equal(response.status, 502)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(response.headers.get('vercel-cdn-cache-control'), null)
  assert.equal(response.headers.get('vercel-cache-tag'), null)

  const payload = parseApiV1ErrorResponse(await response.json())
  assert.equal(payload.code, 'UPSTREAM_UNAVAILABLE')
  assert.equal(payload.requestId, 'req-123')
})

test('GET /api/v1/weekly returns a structured invalid payload error', async () => {
  const app = createApp({
    deepDivesProvider: createProvider(async () => {
      const invalid = createCurrentDeepDives()
      return {
        ...invalid,
        dives: {
          ...invalid.dives,
          normal: {
            ...invalid.dives.normal,
            missions: [createMission()],
          },
        },
      } as unknown as CurrentDeepDives
    }),
  })

  const response = await app.request('/api/v1/weekly')

  assert.equal(response.status, 500)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(response.headers.get('vercel-cdn-cache-control'), null)
  assert.equal(response.headers.get('vercel-cache-tag'), null)

  const payload = parseApiV1ErrorResponse(await response.json())
  assert.equal(payload.code, 'INVALID_RESPONSE_PAYLOAD')
})
