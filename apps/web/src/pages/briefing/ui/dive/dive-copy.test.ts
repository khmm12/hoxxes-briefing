import { describe, expect, it } from 'vitest'
import type { I18n } from '@lingui/core'
import type {
  DeepDiveAnomaly,
  DeepDiveBiome,
  DeepDiveDreadnought,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
} from '~/shared/api'
import { createTestI18n } from '~test/render'
import {
  formatAnomaly,
  formatAnomalyDescription,
  formatBiome,
  formatBiomeDescription,
  formatDiveKind,
  formatDreadnoughtDescription,
  formatMutator,
  formatMutatorDescription,
  formatPrimaryObjective,
  formatPrimaryObjectiveDescription,
  formatSecondaryObjective,
  formatSecondaryObjectiveDescription,
  formatWarning,
  formatWarningDescription,
} from './dive-copy'

type PrimaryDescribedKind = Exclude<DeepDivePrimaryObjective, { kind: 'Elimination' }>['kind']
type SecondaryDescribedKind = Exclude<DeepDiveSecondaryObjective, { kind: 'Elimination' }>['kind']

const i18n: I18n = createTestI18n()

describe('formatDiveKind', () => {
  it('labels a normal dive', () => {
    expect(formatDiveKind(i18n, 'normal')).toBe('Deep Dive')
  })

  it('labels an elite dive', () => {
    expect(formatDiveKind(i18n, 'elite')).toBe('Elite Deep Dive')
  })
})

describe('formatMutator', () => {
  it('dispatches a warning to the warning copy', () => {
    expect(formatMutator(i18n, { kind: 'warning', value: 'RegenerativeBugs' })).toBe('Regenerative Bugs')
    expect(formatMutatorDescription(i18n, { kind: 'warning', value: 'RegenerativeBugs' })).toBe(
      'After a few seconds of not taking damage, the creatures will start recovering health.',
    )
  })

  it('dispatches an anomaly to the anomaly copy', () => {
    expect(formatMutator(i18n, { kind: 'anomaly', value: 'CriticalWeakness' })).toBe('Critical Weakness')
    expect(formatMutatorDescription(i18n, { kind: 'anomaly', value: 'CriticalWeakness' })).toBe(
      'Hitting Weak Points hurts even more than usual.',
    )
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

describe('formatBiomeDescription', () => {
  const biomes: DeepDiveBiome[] = [
    'CrystallineCaverns',
    'FungusBogs',
    'MagmaCore',
    'RadioactiveExclusionZone',
    'DenseBiozone',
    'SandblastedCorridors',
    'SaltPits',
    'GlacialStrata',
    'AzureWeald',
    'HollowBough',
    'OssuaryDepths',
  ]

  it.each(biomes)('describes %s', (biome) => {
    expect(formatBiomeDescription(i18n, biome)).toBeTruthy()
  })

  it('gives every biome its own description', () => {
    const texts = biomes.map((biome) => formatBiomeDescription(i18n, biome))

    expect(new Set(texts).size).toBe(biomes.length)
  })
})

describe('formatPrimaryObjectiveDescription', () => {
  const kinds: PrimaryDescribedKind[] = [
    'DeepScan',
    'EscortDuty',
    'MiningExpedition',
    'IndustrialSabotage',
    'EggHunt',
    'PointExtraction',
    'OnSiteRefining',
    'SalvageOperation',
    'HeavyExtraction',
  ]

  it.each(kinds)('describes %s', (kind) => {
    expect(formatPrimaryObjectiveDescription(i18n, kind)).toBeTruthy()
  })

  it('gives every primary objective its own description', () => {
    const texts = kinds.map((kind) => formatPrimaryObjectiveDescription(i18n, kind))

    expect(new Set(texts).size).toBe(kinds.length)
  })

  it('has no line-level description for Elimination', () => {
    expect(formatPrimaryObjectiveDescription(i18n, 'Elimination')).toBeUndefined()
  })
})

describe('formatSecondaryObjectiveDescription', () => {
  const kinds: SecondaryDescribedKind[] = [
    'EggHunt',
    'DeepScan',
    'Blackbox',
    'MiningExpedition',
    'OnSiteRefining',
    'SalvageOperation',
    'HeavyExtraction',
  ]

  it.each(kinds)('describes %s', (kind) => {
    expect(formatSecondaryObjectiveDescription(i18n, kind)).toBeTruthy()
  })

  it('gives every secondary objective its own description', () => {
    const texts = kinds.map((kind) => formatSecondaryObjectiveDescription(i18n, kind))

    expect(new Set(texts).size).toBe(kinds.length)
  })

  it('has no line-level description for Elimination', () => {
    expect(formatSecondaryObjectiveDescription(i18n, 'Elimination')).toBeUndefined()
  })

  it('describes a primary mission and a secondary side goal differently for a shared kind', () => {
    // Primary = the whole mission; secondary = just the smaller side task. Shared
    // names (Deep Scan, Mining Expedition) must not collapse to identical copy.
    expect(formatSecondaryObjectiveDescription(i18n, 'DeepScan')).not.toBe(
      formatPrimaryObjectiveDescription(i18n, 'DeepScan'),
    )
    expect(formatSecondaryObjectiveDescription(i18n, 'MiningExpedition')).not.toBe(
      formatPrimaryObjectiveDescription(i18n, 'MiningExpedition'),
    )
  })
})

describe('formatDreadnoughtDescription', () => {
  const dreadnoughts: DeepDiveDreadnought[] = ['Classic', 'Hiveguard', 'Twins']

  it.each(dreadnoughts)('describes %s', (dreadnought) => {
    expect(formatDreadnoughtDescription(i18n, dreadnought)).toBeTruthy()
  })

  it('gives every dreadnought variant its own description', () => {
    const texts = dreadnoughts.map((dreadnought) => formatDreadnoughtDescription(i18n, dreadnought))

    expect(new Set(texts).size).toBe(dreadnoughts.length)
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
