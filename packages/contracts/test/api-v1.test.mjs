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
  anomaly: null,
  warning: 'RegenerativeBugs',
})

const createDive = (name) => ({
  name,
  biome: 'AzureWeald',
  missions: [
    createMission(),
    {
      ...createMission(),
      anomaly: 'LowGravity',
      warning: null,
    },
    createMission(),
  ],
})

const createValidBriefingPayload = () => ({
  seed: 1234567890,
  confidence: 'verified',
  release: '2026-04-16T11:00:00.000Z',
  expiration: '2026-04-23T11:00:00.000Z',
  dives: {
    normal: createDive('Crystal Routes'),
    elite: createDive('Lethal Depths'),
  },
})

test('exports the contract revision and negotiation header', () => {
  assert.ok(Number.isInteger(v1.CONTRACT_REV))
  assert.ok(v1.CONTRACT_REV >= 1)
  assert.equal(v1.BRIEFING_CONTRACT_HEADER, 'x-briefing-contract')
})

test('parseBriefingResponse parses a valid briefing payload', () => {
  const parsed = v1.parseBriefingResponse(createValidBriefingPayload())

  assert.equal(parsed.seed, 1234567890)
  assert.equal(parsed.confidence, 'verified')
  assert.equal(parsed.dives.normal.missions.length, 3)
})

test('safeParseBriefingResponse fails when confidence is omitted', () => {
  const payload = createValidBriefingPayload()
  delete payload.confidence

  const result = v1.safeParseBriefingResponse(payload)

  assert.equal(result.success, false)
})

test('safeParseBriefingResponse fails for an unknown confidence value', () => {
  const payload = createValidBriefingPayload()
  payload.confidence = 'probably'

  const result = v1.safeParseBriefingResponse(payload)

  assert.equal(result.success, false)
})

test('safeParseBriefingResponse fails when required fields are omitted', () => {
  const payload = createValidBriefingPayload()
  delete payload.release

  const result = v1.safeParseBriefingResponse(payload)

  assert.equal(result.success, false)
})

test('safeParseBriefingResponse fails when dives are invalid', () => {
  const payload = createValidBriefingPayload()
  payload.dives.normal.missions = [createMission()]

  const result = v1.safeParseBriefingResponse(payload)

  assert.equal(result.success, false)
})

test('parseErrorResponse parses the CONTRACT_RETIRED error code', () => {
  const parsed = v1.parseErrorResponse({
    code: 'CONTRACT_RETIRED',
    message: 'This app version is no longer supported.',
  })

  assert.equal(parsed.code, 'CONTRACT_RETIRED')
})

test('safeParseErrorResponse fails for the retired weekly wire code', () => {
  const result = v1.safeParseErrorResponse({
    code: 'WEEKLY_DATA_UNAVAILABLE',
    message: 'Weekly mission data is currently unavailable.',
  })

  assert.equal(result.success, false)
})

test('safeParseErrorResponse fails for invalid error payloads', () => {
  const result = v1.safeParseErrorResponse({
    code: 'NOT_A_PUBLIC_ERROR_CODE',
    message: 'Something failed',
  })

  assert.equal(result.success, false)
})

test('safeParseErrorResponse fails when required message is omitted', () => {
  const result = v1.safeParseErrorResponse({
    code: 'INTERNAL_ERROR',
  })

  assert.equal(result.success, false)
})

test('parseContractRev accepts bare non-negative decimal integers', () => {
  assert.equal(v1.parseContractRev('0'), 0)
  assert.equal(v1.parseContractRev('1'), 1)
  assert.equal(v1.parseContractRev('42'), 42)
})

test('parseContractRev reads anything else as "no revision sent"', () => {
  for (const header of [
    null,
    undefined,
    '',
    '   ',
    '-1',
    '1.0',
    '1e2',
    '0x10',
    '+1',
    'banana',
    '99999999999999999999',
  ]) {
    assert.equal(v1.parseContractRev(header), null, `header: ${JSON.stringify(header)}`)
  }
})
