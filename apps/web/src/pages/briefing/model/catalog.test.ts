import { describe, expect, it } from 'vitest'
import type { DeepDiveAnomaly, DeepDiveWarning } from '~/shared/api'
import {
  anomalyCatalog,
  getAnomalyCatalogEntry,
  getPrimaryObjectiveCatalogEntry,
  getSecondaryObjectiveCatalogEntry,
  getWarningCatalogEntry,
  type PrimaryObjectiveKind,
  primaryObjectiveCatalog,
  type SecondaryObjectiveKind,
  secondaryObjectiveCatalog,
  warningCatalog,
} from './catalog'

const primaryObjectiveKinds = [
  'DeepScan',
  'EscortDuty',
  'MiningExpedition',
  'IndustrialSabotage',
  'EggHunt',
  'PointExtraction',
  'OnSiteRefining',
  'SalvageOperation',
  'Elimination',
  'HeavyExtraction',
] as const satisfies readonly PrimaryObjectiveKind[]

const secondaryObjectiveKinds = [
  'EggHunt',
  'DeepScan',
  'Blackbox',
  'Elimination',
  'MiningExpedition',
  'OnSiteRefining',
  'SalvageOperation',
  'HeavyExtraction',
] as const satisfies readonly SecondaryObjectiveKind[]

const warningKinds = [
  'HauntedCave',
  'DuckAndCover',
  'LowOxygen',
  'ShieldDisruption',
  'EliteThreat',
  'LethalEnemies',
  'MacteraPlague',
  'RivalPresence',
  'CaveLeechCluster',
  'ExploderInfestation',
  'RegenerativeBugs',
  'EboniteOutbreak',
  'PitJawColony',
  'ScrabNestingGrounds',
  'Parasites',
  'Swarmageddon',
] as const satisfies readonly DeepDiveWarning[]

const anomalyKinds = [
  'BloodSugar',
  'VolatileGuts',
  'CriticalWeakness',
  'LowGravity',
  'RichAtmosphere',
] as const satisfies readonly DeepDiveAnomaly[]

type Expect<T extends true> = T
type Equal<Left, Right> = [Left] extends [Right] ? ([Right] extends [Left] ? true : false) : false

const typeCoverageAssertions: [
  Expect<Equal<PrimaryObjectiveKind, (typeof primaryObjectiveKinds)[number]>>,
  Expect<Equal<SecondaryObjectiveKind, (typeof secondaryObjectiveKinds)[number]>>,
  Expect<Equal<DeepDiveWarning, (typeof warningKinds)[number]>>,
  Expect<Equal<DeepDiveAnomaly, (typeof anomalyKinds)[number]>>,
] = [true, true, true, true]

const objectiveEntryKeys = ['contextTags']
const mutatorEntryKeys = ['intelPriority', 'quickReadPriority']

void typeCoverageAssertions

describe('domain catalog', () => {
  it('covers every current primary objective with only context-tag data', () => {
    expect(Object.keys(primaryObjectiveCatalog)).toEqual([...primaryObjectiveKinds])

    for (const kind of primaryObjectiveKinds) {
      const entry = getPrimaryObjectiveCatalogEntry(kind)

      expect(Object.keys(entry).sort()).toEqual(objectiveEntryKeys)
      expect(entry.contextTags.length).toBeGreaterThan(0)
    }
  })

  it('covers every current secondary objective with only context-tag data', () => {
    expect(Object.keys(secondaryObjectiveCatalog)).toEqual([...secondaryObjectiveKinds])

    for (const kind of secondaryObjectiveKinds) {
      const entry = getSecondaryObjectiveCatalogEntry(kind)

      expect(Object.keys(entry).sort()).toEqual(objectiveEntryKeys)
      expect(entry.contextTags.length).toBeGreaterThan(0)
    }
  })

  it('keeps shared objective names slot-aware through separate catalog entries', () => {
    expect(primaryObjectiveCatalog.DeepScan.contextTags).toEqual(expect.arrayContaining(['long-travel', 'oxygen-risk']))
    expect(secondaryObjectiveCatalog.DeepScan.contextTags).not.toContain('oxygen-risk')
    expect(primaryObjectiveCatalog.OnSiteRefining.contextTags).toContain('long-travel')
    expect(secondaryObjectiveCatalog.OnSiteRefining.contextTags).not.toContain('long-travel')
    expect(primaryObjectiveCatalog.HeavyExtraction).toBeDefined()
    expect(secondaryObjectiveCatalog.HeavyExtraction).toBeDefined()
  })

  it('covers every current warning with priority-only entries', () => {
    expect(Object.keys(warningCatalog)).toEqual([...warningKinds])

    for (const kind of warningKinds) {
      const entry = getWarningCatalogEntry(kind)

      expect(Object.keys(entry).sort()).toEqual(mutatorEntryKeys)
      expect(entry.quickReadPriority).toBeGreaterThan(0)
      expect(entry.intelPriority).not.toBeNull()
    }

    expect(warningCatalog.HauntedCave.intelPriority).toBe(10)
    expect(warningCatalog.LowOxygen.quickReadPriority).toBeLessThan(warningCatalog.DuckAndCover.quickReadPriority)
  })

  it('covers every current anomaly with priority-only entries', () => {
    expect(Object.keys(anomalyCatalog)).toEqual([...anomalyKinds])

    for (const kind of anomalyKinds) {
      const entry = getAnomalyCatalogEntry(kind)

      expect(Object.keys(entry).sort()).toEqual(mutatorEntryKeys)
      expect(entry.quickReadPriority).toBeGreaterThan(0)
    }

    expect(anomalyCatalog.BloodSugar.intelPriority).toBe(210)
    expect(anomalyCatalog.VolatileGuts.intelPriority).toBe(220)
    expect(anomalyCatalog.CriticalWeakness.intelPriority).toBeNull()
    expect(anomalyCatalog.LowGravity.intelPriority).toBeNull()
    expect(anomalyCatalog.RichAtmosphere.intelPriority).toBeNull()
  })
})
