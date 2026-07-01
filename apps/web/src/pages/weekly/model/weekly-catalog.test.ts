import { describe, expect, it } from 'vitest'
import type { DeepDiveAnomaly, DeepDiveWarning } from '~/shared/api'
import {
  getAnomalyCatalogEntry,
  getPrimaryObjectiveCatalogEntry,
  getSecondaryObjectiveCatalogEntry,
  getWarningCatalogEntry,
  type WeeklyPrimaryObjectiveKind,
  type WeeklySecondaryObjectiveKind,
  weeklyAnomalyCatalog,
  weeklyPrimaryObjectiveCatalog,
  weeklySecondaryObjectiveCatalog,
  weeklyWarningCatalog,
} from './weekly-catalog'

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
] as const satisfies readonly WeeklyPrimaryObjectiveKind[]

const secondaryObjectiveKinds = [
  'EggHunt',
  'DeepScan',
  'Blackbox',
  'Elimination',
  'MiningExpedition',
  'OnSiteRefining',
  'SalvageOperation',
  'HeavyExtraction',
] as const satisfies readonly WeeklySecondaryObjectiveKind[]

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
  Expect<Equal<WeeklyPrimaryObjectiveKind, (typeof primaryObjectiveKinds)[number]>>,
  Expect<Equal<WeeklySecondaryObjectiveKind, (typeof secondaryObjectiveKinds)[number]>>,
  Expect<Equal<DeepDiveWarning, (typeof warningKinds)[number]>>,
  Expect<Equal<DeepDiveAnomaly, (typeof anomalyKinds)[number]>>,
] = [true, true, true, true]

const objectiveEntryKeys = ['contextTags']
const effectEntryKeys = ['intelPriority', 'quickReadPriority']

void typeCoverageAssertions

describe('weekly domain catalog', () => {
  it('covers every current primary objective with only route context data', () => {
    expect(Object.keys(weeklyPrimaryObjectiveCatalog)).toEqual([...primaryObjectiveKinds])

    for (const kind of primaryObjectiveKinds) {
      const entry = getPrimaryObjectiveCatalogEntry(kind)

      expect(Object.keys(entry).sort()).toEqual(objectiveEntryKeys)
      expect(entry.contextTags.length).toBeGreaterThan(0)
    }
  })

  it('covers every current secondary objective with only route context data', () => {
    expect(Object.keys(weeklySecondaryObjectiveCatalog)).toEqual([...secondaryObjectiveKinds])

    for (const kind of secondaryObjectiveKinds) {
      const entry = getSecondaryObjectiveCatalogEntry(kind)

      expect(Object.keys(entry).sort()).toEqual(objectiveEntryKeys)
      expect(entry.contextTags.length).toBeGreaterThan(0)
    }
  })

  it('keeps shared objective names slot-aware through separate catalog entries', () => {
    expect(weeklyPrimaryObjectiveCatalog.DeepScan.contextTags).toEqual(
      expect.arrayContaining(['long-travel', 'oxygen-risk']),
    )
    expect(weeklySecondaryObjectiveCatalog.DeepScan.contextTags).not.toContain('oxygen-risk')
    expect(weeklyPrimaryObjectiveCatalog.OnSiteRefining.contextTags).toContain('long-travel')
    expect(weeklySecondaryObjectiveCatalog.OnSiteRefining.contextTags).not.toContain('long-travel')
    expect(weeklyPrimaryObjectiveCatalog.HeavyExtraction).toBeDefined()
    expect(weeklySecondaryObjectiveCatalog.HeavyExtraction).toBeDefined()
  })

  it('covers every current warning with priority-only entries', () => {
    expect(Object.keys(weeklyWarningCatalog)).toEqual([...warningKinds])

    for (const kind of warningKinds) {
      const entry = getWarningCatalogEntry(kind)

      expect(Object.keys(entry).sort()).toEqual(effectEntryKeys)
      expect(entry.quickReadPriority).toBeGreaterThan(0)
      expect(entry.intelPriority).not.toBeNull()
    }

    expect(weeklyWarningCatalog.HauntedCave.intelPriority).toBe(10)
    expect(weeklyWarningCatalog.LowOxygen.quickReadPriority).toBeLessThan(
      weeklyWarningCatalog.DuckAndCover.quickReadPriority,
    )
  })

  it('covers every current anomaly with priority-only entries', () => {
    expect(Object.keys(weeklyAnomalyCatalog)).toEqual([...anomalyKinds])

    for (const kind of anomalyKinds) {
      const entry = getAnomalyCatalogEntry(kind)

      expect(Object.keys(entry).sort()).toEqual(effectEntryKeys)
      expect(entry.quickReadPriority).toBeGreaterThan(0)
    }

    expect(weeklyAnomalyCatalog.BloodSugar.intelPriority).toBe(210)
    expect(weeklyAnomalyCatalog.VolatileGuts.intelPriority).toBe(220)
    expect(weeklyAnomalyCatalog.CriticalWeakness.intelPriority).toBeNull()
    expect(weeklyAnomalyCatalog.LowGravity.intelPriority).toBeNull()
    expect(weeklyAnomalyCatalog.RichAtmosphere.intelPriority).toBeNull()
  })
})
