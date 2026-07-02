import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  type Briefing,
  DEEP_DIVE_ANOMALIES,
  DEEP_DIVE_BIOMES,
  DEEP_DIVE_DREADNOUGHTS,
  DEEP_DIVE_WARNINGS,
  type DeepDivePrimaryObjective,
  type DeepDiveSecondaryObjective,
} from '../../application/models/briefing.ts'
import { generateBriefing } from './generator-bridge.ts'

type GeneratedBriefing = Pick<Briefing, 'seed' | 'dives'>

const primaryObjectiveKeysByKind = {
  DeepScan: ['kind', 'resonanceCrystals'],
  EscortDuty: ['kind', 'refuels'],
  MiningExpedition: ['kind', 'morkite'],
  IndustrialSabotage: ['kind', 'powerStations'],
  EggHunt: ['kind', 'eggs'],
  PointExtraction: ['kind', 'aquarqs'],
  OnSiteRefining: ['kind', 'morkiteWells'],
  SalvageOperation: ['kind', 'miniMules'],
  Elimination: ['kind', 'dreadnoughts'],
  HeavyExtraction: ['kind', 'resiniteMasses'],
} satisfies Record<DeepDivePrimaryObjective['kind'], string[]>

const secondaryObjectiveKeysByKind = {
  EggHunt: ['kind', 'eggs'],
  DeepScan: ['kind', 'resonanceCrystals'],
  Blackbox: ['kind', 'blackBoxes'],
  Elimination: ['kind', 'dreadnoughts'],
  MiningExpedition: ['kind', 'morkite'],
  OnSiteRefining: ['kind', 'morkiteWells'],
  SalvageOperation: ['kind', 'miniMules'],
  HeavyExtraction: ['kind', 'resiniteMasses'],
} satisfies Record<DeepDiveSecondaryObjective['kind'], string[]>

const assertObjectKeys = (value: Record<string, unknown>, keys: string[]): void => {
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort())
}

const assertKnownObjective = (
  objective: DeepDivePrimaryObjective | DeepDiveSecondaryObjective,
  expectedKeysByKind: Record<string, string[]>,
): void => {
  assertObjectKeys(objective, expectedKeysByKind[objective.kind])

  if (objective.kind === 'Elimination') {
    assert.ok(objective.dreadnoughts.length > 0)
    for (const dreadnought of objective.dreadnoughts) {
      assert.ok(DEEP_DIVE_DREADNOUGHTS.includes(dreadnought))
    }
  }
}

describe('generateBriefing', () => {
  it('returns the WASM payload in the application model shape', () => {
    const generated: GeneratedBriefing = generateBriefing(1234567890)

    assertGeneratedBriefingShape(generated)
  })
})

function assertGeneratedBriefingShape(generated: GeneratedBriefing): void {
  assertObjectKeys(generated, ['seed', 'dives'])
  assert.equal(Number.isInteger(generated.seed), true)
  assertObjectKeys(generated.dives, ['normal', 'elite'])

  for (const dive of [generated.dives.normal, generated.dives.elite]) {
    assertObjectKeys(dive, ['name', 'biome', 'missions'])
    assert.equal(typeof dive.name, 'string')
    assert.ok(dive.name.length > 0)
    assert.ok(DEEP_DIVE_BIOMES.includes(dive.biome))
    assert.equal(dive.missions.length, 3)

    for (const mission of dive.missions) {
      assertObjectKeys(mission, ['primaryObjective', 'secondaryObjective', 'anomaly', 'warning'])
      assertKnownObjective(mission.primaryObjective, primaryObjectiveKeysByKind)
      assertKnownObjective(mission.secondaryObjective, secondaryObjectiveKeysByKind)

      assert.notEqual(mission.anomaly, undefined)
      assert.notEqual(mission.warning, undefined)

      if (mission.anomaly !== null) {
        assert.ok(DEEP_DIVE_ANOMALIES.includes(mission.anomaly))
      }
      if (mission.warning !== null) {
        assert.ok(DEEP_DIVE_WARNINGS.includes(mission.warning))
      }
    }
  }
}
