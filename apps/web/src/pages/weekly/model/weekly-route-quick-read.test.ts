import { describe, expect, it } from 'vitest'
import type { WeeklyDive, WeeklyMission } from './weekly-route-catalog'
import { buildQuickReadChips } from './weekly-route-quick-read'

describe('buildQuickReadChips', () => {
  it('sorts warnings before mutators and removes duplicates', () => {
    const chips = buildQuickReadChips(createDive())

    expect(chips.map((chip) => chip.kind)).toEqual(['warning', 'warning', 'mutator', 'mutator'])
    expect(chips.map((chip) => chip.value)).toEqual(['LowOxygen', 'DuckAndCover', 'VolatileGuts', 'RichAtmosphere'])
  })

  it('sorts warnings by catalog risk priority', () => {
    expect(buildQuickReadChips(createDiveWithWarnings()).map((chip) => chip.value)).toEqual([
      'HauntedCave',
      'ShieldDisruption',
      'Swarmageddon',
    ])
  })

  it('sorts mixed mutators before beneficial mutators', () => {
    expect(buildQuickReadChips(createDiveWithMutators()).map((chip) => chip.value)).toEqual([
      'BloodSugar',
      'VolatileGuts',
      'CriticalWeakness',
    ])
  })

  it('returns empty list when the route has no hazards', () => {
    expect(buildQuickReadChips(createDiveWithCleanStages())).toHaveLength(0)
  })
})

function createDive(): WeeklyDive {
  return {
    name: 'Crystal Routes',
    biome: 'AzureWeald',
    missions: [
      createMission({ mutator: 'RichAtmosphere', warning: 'LowOxygen' }),
      createMission({ mutator: 'VolatileGuts', warning: 'DuckAndCover' }),
      createMission({ mutator: 'RichAtmosphere', warning: null }),
    ],
  }
}

function createDiveWithCleanStages(): WeeklyDive {
  return {
    name: 'Clean Routes',
    biome: 'SaltPits',
    missions: [createMission(), createMission(), createMission()],
  }
}

function createDiveWithWarnings(): WeeklyDive {
  return {
    name: 'Warning Routes',
    biome: 'MagmaCore',
    missions: [
      createMission({ warning: 'Swarmageddon' }),
      createMission({ warning: 'HauntedCave' }),
      createMission({ warning: 'ShieldDisruption' }),
    ],
  }
}

function createDiveWithMutators(): WeeklyDive {
  return {
    name: 'Mutator Routes',
    biome: 'DenseBiozone',
    missions: [
      createMission({ mutator: 'CriticalWeakness' }),
      createMission({ mutator: 'BloodSugar' }),
      createMission({ mutator: 'VolatileGuts' }),
    ],
  }
}

function createMission(overrides: Partial<Pick<WeeklyMission, 'mutator' | 'warning'>> = {}): WeeklyMission {
  return {
    primaryObjective: {
      kind: 'DeepScan',
      resonanceCrystals: 2,
    },
    secondaryObjective: {
      blackBoxes: 1,
      kind: 'Blackbox',
    },
    mutator: null,
    warning: null,
    ...overrides,
  }
}
