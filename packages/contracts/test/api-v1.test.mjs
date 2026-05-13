import assert from 'node:assert/strict'
import test from 'node:test'
import * as v1 from '@hoxxes-briefing/contracts/api/v1'

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
  const parsed = v1.parseWeeklyResponse(createValidWeeklyPayload())

  assert.equal(parsed.week.id, '2026-W17')
  assert.equal(parsed.dives.normal.missions.length, 3)
})

test('safeParseApiV1ErrorResponse fails for invalid error payloads', () => {
  const result = v1.safeParseErrorResponse({
    code: 'NOT_A_PUBLIC_ERROR_CODE',
    message: 'Something failed',
  })

  assert.equal(result.success, false)
})

test('safeParseApiV1WeeklyResponse fails when required fields are omitted', () => {
  const payload = createValidWeeklyPayload()
  delete payload.week.release

  const result = v1.safeParseWeeklyResponse(payload)

  assert.equal(result.success, false)
})

test('safeParseApiV1WeeklyResponse fails when weekly dives are invalid', () => {
  const payload = createValidWeeklyPayload()
  payload.dives.normal.missions = [createMission()]

  const result = v1.safeParseWeeklyResponse(payload)

  assert.equal(result.success, false)
})

test('safeParseApiV1ErrorResponse fails when required message is omitted', () => {
  const result = v1.safeParseErrorResponse({
    code: 'INTERNAL_ERROR',
  })

  assert.equal(result.success, false)
})
