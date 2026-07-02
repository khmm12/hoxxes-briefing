import { describe, expect, it } from 'vitest'
import type { I18n } from '@lingui/core'
import type {
  DeepDiveAnomaly,
  DeepDiveBiome,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
} from '~/shared/api'
import { createTestI18n } from '~test/render'
import {
  formatAnomaly,
  formatAnomalyDescription,
  formatBiome,
  formatDiveKind,
  formatPrimaryObjective,
  formatSecondaryObjective,
  formatWarning,
  formatWarningDescription,
} from './dive-copy'

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
  const cases: Array<[DeepDiveBiome, string]> = [
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
  const cases: Array<[DeepDivePrimaryObjective, string]> = [
    [{ kind: 'DeepScan', resonanceCrystals: 3 }, 'Deep Scan x3'],
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
    const objective: DeepDivePrimaryObjective = {
      kind: 'Elimination',
      dreadnoughts: ['Classic', 'Hiveguard', 'Twins'],
    }

    expect(formatPrimaryObjective(i18n, objective)).toBe('Dreadnought x3 (Classic + Hiveguard + Twins)')
  })
})

describe('formatSecondaryObjective', () => {
  const cases: Array<[DeepDiveSecondaryObjective, string]> = [
    [{ kind: 'EggHunt', eggs: 2 }, 'Egg x2'],
    [{ kind: 'DeepScan', resonanceCrystals: 5 }, 'Deep Scan x5'],
    [{ kind: 'Blackbox', blackBoxes: 1 }, 'Black Box'],
    [{ kind: 'MiningExpedition', morkite: 150 }, 'Morkite x150'],
    [{ kind: 'OnSiteRefining', morkiteWells: 1 }, 'Morkite Well x1'],
    [{ kind: 'SalvageOperation', miniMules: 3 }, 'Mule x3'],
    [{ kind: 'HeavyExtraction', resiniteMasses: 1 }, 'Resinite Mass x1'],
  ]

  it.each(cases)('formats $kind', (objective, expected) => {
    expect(formatSecondaryObjective(i18n, objective)).toBe(expected)
  })

  it('lists every dreadnought variant for Elimination', () => {
    const objective: DeepDiveSecondaryObjective = {
      kind: 'Elimination',
      dreadnoughts: ['Classic'],
    }

    expect(formatSecondaryObjective(i18n, objective)).toBe('Dreadnought x1 (Classic)')
  })
})

describe('formatAnomaly', () => {
  it('returns None for no anomaly', () => {
    expect(formatAnomaly(i18n, null)).toBe('None')
  })

  const cases: Array<[DeepDiveAnomaly, string]> = [
    ['VolatileGuts', 'Volatile Guts'],
    ['RichAtmosphere', 'Rich Atmosphere'],
    ['CriticalWeakness', 'Critical Weakness'],
    ['BloodSugar', 'Blood Sugar'],
    ['LowGravity', 'Low Gravity'],
  ]

  it.each(cases)('formats %s', (anomaly, expected) => {
    expect(formatAnomaly(i18n, anomaly)).toBe(expected)
  })
})

describe('formatWarning', () => {
  it('returns None for no warning', () => {
    expect(formatWarning(i18n, null)).toBe('None')
  })

  const cases: Array<[DeepDiveWarning, string]> = [
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

describe('formatAnomalyDescription', () => {
  const anomalies: DeepDiveAnomaly[] = [
    'VolatileGuts',
    'RichAtmosphere',
    'CriticalWeakness',
    'BloodSugar',
    'LowGravity',
  ]

  it.each(anomalies)('returns flavor text for %s', (anomaly) => {
    expect(formatAnomalyDescription(i18n, anomaly)).toBeTruthy()
  })

  it('gives every anomaly its own flavor text', () => {
    const texts = anomalies.map((anomaly) => formatAnomalyDescription(i18n, anomaly))

    expect(new Set(texts).size).toBe(anomalies.length)
  })
})

describe('formatWarningDescription', () => {
  const warnings: DeepDiveWarning[] = [
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

  it('gives every warning its own flavor text', () => {
    const texts = warnings.map((warning) => formatWarningDescription(i18n, warning))

    expect(new Set(texts).size).toBe(warnings.length)
  })
})
