import assert from 'node:assert/strict'
import test from 'node:test'
import * as v1 from '@hoxxes-briefing/contracts/api/v1'

// The happy-path fixtures are typed against the contract, so a wire-shape
// change that the fixtures no longer satisfy fails typecheck here before it
// ever reaches a runtime assertion. Negative cases below deliberately step
// outside the types (omitting or corrupting fields) and lean on `safeParse`,
// whose input is `unknown`, to prove the schema rejects them at runtime.
const createMission = (): v1.DeepDiveMission => ({
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

const createDive = (name: string): v1.DeepDive => ({
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

const createValidBriefingPayload = (): v1.BriefingResponse => ({
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
  const { confidence: _confidence, ...withoutConfidence } = createValidBriefingPayload()

  const result = v1.safeParseBriefingResponse(withoutConfidence)

  assert.equal(result.success, false)
})

test('safeParseBriefingResponse fails for an unknown confidence value', () => {
  const result = v1.safeParseBriefingResponse({
    ...createValidBriefingPayload(),
    confidence: 'probably',
  })

  assert.equal(result.success, false)
})

test('safeParseBriefingResponse fails when required fields are omitted', () => {
  const { release: _release, ...withoutRelease } = createValidBriefingPayload()

  const result = v1.safeParseBriefingResponse(withoutRelease)

  assert.equal(result.success, false)
})

test('safeParseBriefingResponse fails when a dive carries the wrong mission count', () => {
  const invalidMissionLists = [
    [createMission(), createMission()],
    [createMission(), createMission(), createMission(), createMission()],
  ]

  for (const missions of invalidMissionLists) {
    const payload = createValidBriefingPayload()
    const result = v1.safeParseBriefingResponse({
      ...payload,
      dives: {
        ...payload.dives,
        normal: { ...payload.dives.normal, missions },
      },
    })

    assert.equal(result.success, false, `${missions.length} missions`)
  }
})

test('safeParseBriefingResponse rejects empty Elimination dreadnoughts in either objective branch', () => {
  for (const objective of ['primaryObjective', 'secondaryObjective'] as const) {
    const payload = createValidBriefingPayload()
    const firstMission = payload.dives.normal.missions[0]

    const result = v1.safeParseBriefingResponse({
      ...payload,
      dives: {
        ...payload.dives,
        normal: {
          ...payload.dives.normal,
          missions: [
            {
              ...firstMission,
              [objective]: { kind: 'Elimination', dreadnoughts: [] },
            },
            ...payload.dives.normal.missions.slice(1),
          ],
        },
      },
    })

    assert.equal(result.success, false, objective)
  }
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
