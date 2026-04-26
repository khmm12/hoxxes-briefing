import { describe, expect, it } from 'vitest'
import {
  getMutatorCatalogEntry,
  getPrimaryObjectiveCatalogEntry,
  getSecondaryObjectiveCatalogEntry,
  getWarningCatalogEntry,
  type PresentWeeklyMutator,
  type PresentWeeklyWarning,
  type WeeklyPrimaryObjectiveKind,
  type WeeklySecondaryObjectiveKind,
  weeklyMutatorCatalog,
  weeklyPrimaryObjectiveCatalog,
  weeklySecondaryObjectiveCatalog,
  weeklyWarningCatalog,
} from './weekly-route-catalog'

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
  'HeavyExcavation',
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
] as const satisfies readonly PresentWeeklyWarning[]

const mutatorKinds = [
  'BloodSugar',
  'VolatileGuts',
  'CriticalWeakness',
  'LowGravity',
  'RichAtmosphere',
] as const satisfies readonly PresentWeeklyMutator[]

type Expect<T extends true> = T
type Equal<Left, Right> = [Left] extends [Right] ? ([Right] extends [Left] ? true : false) : false

const typeCoverageAssertions: [
  Expect<Equal<WeeklyPrimaryObjectiveKind, (typeof primaryObjectiveKinds)[number]>>,
  Expect<Equal<WeeklySecondaryObjectiveKind, (typeof secondaryObjectiveKinds)[number]>>,
  Expect<Equal<PresentWeeklyWarning, (typeof warningKinds)[number]>>,
  Expect<Equal<PresentWeeklyMutator, (typeof mutatorKinds)[number]>>,
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
    expect(weeklySecondaryObjectiveCatalog.HeavyExcavation).toBeDefined()
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

  it('covers every current mutator with priority-only entries', () => {
    expect(Object.keys(weeklyMutatorCatalog)).toEqual([...mutatorKinds])

    for (const kind of mutatorKinds) {
      const entry = getMutatorCatalogEntry(kind)

      expect(Object.keys(entry).sort()).toEqual(effectEntryKeys)
      expect(entry.quickReadPriority).toBeGreaterThan(0)
    }

    expect(weeklyMutatorCatalog.BloodSugar.intelPriority).toBe(210)
    expect(weeklyMutatorCatalog.VolatileGuts.intelPriority).toBe(220)
    expect(weeklyMutatorCatalog.CriticalWeakness.intelPriority).toBeNull()
    expect(weeklyMutatorCatalog.LowGravity.intelPriority).toBeNull()
    expect(weeklyMutatorCatalog.RichAtmosphere.intelPriority).toBeNull()
  })
})
