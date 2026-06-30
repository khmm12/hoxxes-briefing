import { describe, expect, it } from 'vitest'
import type { I18n } from '@lingui/core'
import type { WeeklySnapshotResult } from '~/shared/api'
import { createTestI18n } from '~test/render'
import {
  formatBiome,
  formatDiveKind,
  formatMutator,
  formatMutatorDescription,
  formatPrimaryObjective,
  formatSecondaryObjective,
  formatWarning,
  formatWarningDescription,
} from './weekly-dive-copy'

type WeeklyDive = WeeklySnapshotResult['dives']['normal']
type PrimaryObjective = WeeklyDive['missions'][number]['primaryObjective']
type SecondaryObjective = WeeklyDive['missions'][number]['secondaryObjective']

const i18n: I18n = createTestI18n()

describe('formatDiveKind', () => {
  it('labels a normal dive', () => {
    expect(formatDiveKind(i18n, 'normal')).toBe('Deep Dive')
  })

  it('labels an elite dive', () => {
    expect(formatDiveKind(i18n, 'elite')).toBe('Elite Deep Dive')
  })
})

describe('formatBiome', () => {
  const cases: Array<[WeeklyDive['biome'], string]> = [
    ['CrystallineCaverns', 'Crystalline Caverns'],
    ['FungusBogs', 'Fungus Bogs'],
    ['MagmaCore', 'Magma Core'],
    ['RadioactiveExclusionZone', 'Radioactive Exclusion Zone'],
    ['DenseBiozone', 'Dense Biozone'],
    ['SandblastedCorridors', 'Sandblasted Corridors'],
    ['SaltPits', 'Salt Pits'],
    ['GlacialStrata', 'Glacial Strata'],
    ['AzureWeald', 'Azure Weald'],
    ['HollowBough', 'Hollow Bough'],
    ['OssuaryDepths', 'Ossuary Depths'],
  ]

  it.each(cases)('formats %s', (biome, expected) => {
    expect(formatBiome(i18n, biome)).toBe(expected)
  })
})

describe('formatPrimaryObjective', () => {
  const cases: Array<[PrimaryObjective, string]> = [
    [{ kind: 'DeepScan', resonanceCrystals: 3 }, 'Crystal Scan x3'],
    [{ kind: 'EscortDuty', refuels: 2 }, 'Escort Duty'],
    [{ kind: 'MiningExpedition', morkite: 150 }, 'Morkite x150'],
    [{ kind: 'IndustrialSabotage', powerStations: 1 }, 'Industrial Sabotage'],
    [{ kind: 'EggHunt', eggs: 6 }, 'Egg x6'],
    [{ kind: 'PointExtraction', aquarqs: 10 }, 'Aquarq x10'],
    [{ kind: 'OnSiteRefining', morkiteWells: 1 }, 'Morkite Well x1'],
    [{ kind: 'SalvageOperation', miniMules: 3 }, 'Mule x3'],
    [{ kind: 'HeavyExtraction', resiniteMasses: 1 }, 'Resinite Mass x1'],
  ]

  it.each(cases)('formats $kind', (objective, expected) => {
    expect(formatPrimaryObjective(i18n, objective)).toBe(expected)
  })

  it('lists every dreadnought variant for Elimination', () => {
    const objective: PrimaryObjective = {
      kind: 'Elimination',
      dreadnoughts: ['Dreadnought', 'Hiveguard', 'Twins'],
    }

    expect(formatPrimaryObjective(i18n, objective)).toBe('Dreadnought x3 (Classic + Hiveguard + Twins)')
  })
})

describe('formatSecondaryObjective', () => {
  const cases: Array<[SecondaryObjective, string]> = [
    [{ kind: 'EggHunt', eggs: 2 }, 'Egg x2'],
    [{ kind: 'DeepScan', resonanceCrystals: 5 }, 'Crystal Scan x5'],
    [{ kind: 'Blackbox', blackBoxes: 1 }, 'Black Box'],
    [{ kind: 'MiningExpedition', morkite: 150 }, 'Morkite x150'],
    [{ kind: 'OnSiteRefining', morkiteWells: 1 }, 'Morkite Well x1'],
    [{ kind: 'SalvageOperation', miniMules: 3 }, 'Mule x3'],
    [{ kind: 'HeavyExcavation', resiniteMasses: 1 }, 'Resinite Mass x1'],
  ]

  it.each(cases)('formats $kind', (objective, expected) => {
    expect(formatSecondaryObjective(i18n, objective)).toBe(expected)
  })

  it('lists every dreadnought variant for Elimination', () => {
    const objective: SecondaryObjective = {
      kind: 'Elimination',
      dreadnoughts: ['Dreadnought'],
    }

    expect(formatSecondaryObjective(i18n, objective)).toBe('Dreadnought x1 (Classic)')
  })
})

describe('formatMutator', () => {
  it('returns None for no mutator', () => {
    expect(formatMutator(i18n, null)).toBe('None')
  })

  const cases: Array<[NonNullable<WeeklyDive['missions'][number]['mutator']>, string]> = [
    ['VolatileGuts', 'Volatile Guts'],
    ['RichAtmosphere', 'Rich Atmosphere'],
    ['CriticalWeakness', 'Critical Weakness'],
    ['BloodSugar', 'Blood Sugar'],
    ['LowGravity', 'Low Gravity'],
  ]

  it.each(cases)('formats %s', (mutator, expected) => {
    expect(formatMutator(i18n, mutator)).toBe(expected)
  })
})

describe('formatWarning', () => {
  it('returns None for no warning', () => {
    expect(formatWarning(i18n, null)).toBe('None')
  })

  const cases: Array<[NonNullable<WeeklyDive['missions'][number]['warning']>, string]> = [
    ['RegenerativeBugs', 'Regenerative Bugs'],
    ['EliteThreat', 'Elite Threat'],
    ['MacteraPlague', 'Mactera Plague'],
    ['EboniteOutbreak', 'Ebonite Outbreak'],
    ['DuckAndCover', 'Duck and Cover'],
    ['CaveLeechCluster', 'Cave Leech Cluster'],
    ['LowOxygen', 'Low Oxygen'],
    ['ExploderInfestation', 'Exploder Infestation'],
    ['HauntedCave', 'Haunted Cave'],
    ['LethalEnemies', 'Lethal Enemies'],
    ['ShieldDisruption', 'Shield Disruption'],
    ['Parasites', 'Parasites'],
    ['Swarmageddon', 'Swarmageddon'],
    ['RivalPresence', 'Rival Presence'],
    ['PitJawColony', 'Pit-Jaw Colony'],
    ['ScrabNestingGrounds', 'Scrab Nesting Grounds'],
  ]

  it.each(cases)('formats %s', (warning, expected) => {
    expect(formatWarning(i18n, warning)).toBe(expected)
  })
})

describe('formatMutatorDescription', () => {
  const mutators: Array<NonNullable<WeeklyDive['missions'][number]['mutator']>> = [
    'VolatileGuts',
    'RichAtmosphere',
    'CriticalWeakness',
    'BloodSugar',
    'LowGravity',
  ]

  it.each(mutators)('returns flavor text for %s', (mutator) => {
    expect(formatMutatorDescription(i18n, mutator)).toBeTruthy()
  })
})

describe('formatWarningDescription', () => {
  const warnings: Array<NonNullable<WeeklyDive['missions'][number]['warning']>> = [
    'RegenerativeBugs',
    'EliteThreat',
    'MacteraPlague',
    'EboniteOutbreak',
    'DuckAndCover',
    'CaveLeechCluster',
    'LowOxygen',
    'ExploderInfestation',
    'HauntedCave',
    'LethalEnemies',
    'ShieldDisruption',
    'Parasites',
    'Swarmageddon',
    'RivalPresence',
    'PitJawColony',
    'ScrabNestingGrounds',
  ]

  it.each(warnings)('returns flavor text for %s', (warning) => {
    expect(formatWarningDescription(i18n, warning)).toBeTruthy()
  })
})
