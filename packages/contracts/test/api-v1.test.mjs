import assert from 'node:assert/strict'
import test from 'node:test'

import {
  parseApiV1WeeklyResponse as parseApiV1WeeklyResponseFromRoot,
  safeParseApiV1ErrorResponse as safeParseApiV1ErrorResponseFromRoot,
} from '@hoxxes-briefing/contracts'
import {
  apiV1,
  parseApiV1WeeklyResponse,
  safeParseApiV1ErrorResponse,
  safeParseApiV1WeeklyResponse,
} from '@hoxxes-briefing/contracts/api/v1'

const createMission = () => ({
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
})

const createDive = (name) => ({
  name,
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
})

const createValidWeeklyPayload = () => ({
  week: {
    id: '2026-W17',
    seed: 1234567890,
    release: '2026-04-16T11:00:00.000Z',
    expiration: '2026-04-23T11:00:00.000Z',
  },
  dives: {
    normal: createDive('Crystal Routes'),
    elite: createDive('Lethal Depths'),
  },
})

test('parseApiV1WeeklyResponse parses a valid weekly payload', () => {
  const parsed = parseApiV1WeeklyResponse(createValidWeeklyPayload())

  assert.equal(parsed.week.id, '2026-W17')
  assert.equal(parsed.dives.normal.missions.length, 3)
})

test('package root and api/v1 exports support weekly and error helpers', () => {
  const payload = createValidWeeklyPayload()
  const parsedFromRoot = parseApiV1WeeklyResponseFromRoot(payload)
  const parsedFromVersionedPath = parseApiV1WeeklyResponse(payload)
  const invalidError = {
    code: 'NOT_A_PUBLIC_ERROR_CODE',
    message: 'Something failed',
  }

  assert.deepEqual(parsedFromRoot, parsedFromVersionedPath)
  assert.deepEqual(apiV1.parse.weekly(payload), parsedFromVersionedPath)
  assert.equal(safeParseApiV1ErrorResponseFromRoot(invalidError).success, false)
})

test('safeParseApiV1ErrorResponse fails for invalid error payloads', () => {
  const result = safeParseApiV1ErrorResponse({
    code: 'NOT_A_PUBLIC_ERROR_CODE',
    message: 'Something failed',
  })

  assert.equal(result.success, false)
})

test('safeParseApiV1WeeklyResponse fails when required fields are omitted', () => {
  const payload = createValidWeeklyPayload()
  delete payload.week.release

  const result = safeParseApiV1WeeklyResponse(payload)

  assert.equal(result.success, false)
})

test('safeParseApiV1WeeklyResponse fails when deprecated freshness is present', () => {
  const payload = {
    ...createValidWeeklyPayload(),
    freshness: {
      state: 'fresh',
      source: 'live',
      generatedAt: '2026-04-21T10:00:00.000Z',
      checkedAt: '2026-04-21T10:01:00.000Z',
    },
  }

  const result = safeParseApiV1WeeklyResponse(payload)

  assert.equal(result.success, false)
})

test('safeParseApiV1WeeklyResponse fails when weekly dives are invalid', () => {
  const payload = createValidWeeklyPayload()
  payload.dives.normal.missions = [createMission()]

  const result = safeParseApiV1WeeklyResponse(payload)

  assert.equal(result.success, false)
})

test('safeParseApiV1ErrorResponse fails when required message is omitted', () => {
  const result = safeParseApiV1ErrorResponse({
    code: 'INTERNAL_ERROR',
  })

  assert.equal(result.success, false)
})
