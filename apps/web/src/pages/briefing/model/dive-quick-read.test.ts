import { describe, expect, it } from 'vitest'
import type { DeepDive, DeepDiveMission } from '~/shared/api'
import { buildQuickReadChips } from './dive-quick-read'

describe('buildQuickReadChips', () => {
  it('sorts warnings before anomalies and removes duplicates', () => {
    const chips = buildQuickReadChips(createDive())

    expect(chips.map((chip) => chip.kind)).toEqual(['warning', 'warning', 'anomaly', 'anomaly'])
    expect(chips.map((chip) => chip.value)).toEqual(['LowOxygen', 'DuckAndCover', 'VolatileGuts', 'RichAtmosphere'])
  })

  it('sorts warnings by catalog risk priority', () => {
    expect(buildQuickReadChips(createDiveWithWarnings()).map((chip) => chip.value)).toEqual([
      'HauntedCave',
      'ShieldDisruption',
      'Swarmageddon',
    ])
  })

  it('sorts mixed anomalies before beneficial anomalies', () => {
    expect(buildQuickReadChips(createDiveWithAnomalies()).map((chip) => chip.value)).toEqual([
      'BloodSugar',
      'VolatileGuts',
      'CriticalWeakness',
    ])
  })

  it('returns empty list when the dive has no anomalies', () => {
    expect(buildQuickReadChips(createDiveWithCleanStages())).toHaveLength(0)
  })
})

function createDive(): DeepDive {
  return {
    name: 'Crystal Depths',
    biome: 'AzureWeald',
    missions: [
      createMission({ anomaly: 'RichAtmosphere', warning: 'LowOxygen' }),
      createMission({ anomaly: 'VolatileGuts', warning: 'DuckAndCover' }),
      createMission({ anomaly: 'RichAtmosphere', warning: null }),
    ],
  }
}

function createDiveWithCleanStages(): DeepDive {
  return {
    name: 'Placid Caverns',
    biome: 'SaltPits',
    missions: [createMission(), createMission(), createMission()],
  }
}

function createDiveWithWarnings(): DeepDive {
  return {
    name: 'Molten Warren',
    biome: 'MagmaCore',
    missions: [
      createMission({ warning: 'Swarmageddon' }),
      createMission({ warning: 'HauntedCave' }),
      createMission({ warning: 'ShieldDisruption' }),
    ],
  }
}

function createDiveWithAnomalies(): DeepDive {
  return {
    name: 'Verdant Reach',
    biome: 'DenseBiozone',
    missions: [
      createMission({ anomaly: 'CriticalWeakness' }),
      createMission({ anomaly: 'BloodSugar' }),
      createMission({ anomaly: 'VolatileGuts' }),
    ],
  }
}

function createMission(overrides: Partial<Pick<DeepDiveMission, 'anomaly' | 'warning'>> = {}): DeepDiveMission {
  return {
    primaryObjective: {
      kind: 'DeepScan',
      resonanceCrystals: 2,
    },
    secondaryObjective: {
      blackBoxes: 1,
      kind: 'Blackbox',
    },
    anomaly: null,
    warning: null,
    ...overrides,
  }
}
