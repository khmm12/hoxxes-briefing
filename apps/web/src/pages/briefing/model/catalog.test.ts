import { describe, expect, it } from 'vitest'
import type { DeepDiveAnomaly, DeepDiveWarning } from '~/shared/api'
import {
  mutatorSeverity,
  type PrimaryObjectiveKind,
  primaryObjectiveCatalog,
  type SecondaryObjectiveKind,
  secondaryObjectiveCatalog,
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

void typeCoverageAssertions

describe('domain catalog', () => {
  it('covers every current primary objective with only context-tag data', () => {
    expect(Object.keys(primaryObjectiveCatalog)).toEqual([...primaryObjectiveKinds])

    for (const kind of primaryObjectiveKinds) {
      const entry = primaryObjectiveCatalog[kind]

      expect(Object.keys(entry).sort()).toEqual(objectiveEntryKeys)
      expect(entry.contextTags.length).toBeGreaterThan(0)
    }
  })

  it('covers every current secondary objective with only context-tag data', () => {
    expect(Object.keys(secondaryObjectiveCatalog)).toEqual([...secondaryObjectiveKinds])

    for (const kind of secondaryObjectiveKinds) {
      const entry = secondaryObjectiveCatalog[kind]

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

  it('grades every current mutator on the single severity ladder', () => {
    expect(Object.keys(mutatorSeverity).sort()).toEqual([...warningKinds, ...anomalyKinds].sort())

    for (const kind of [...warningKinds, ...anomalyKinds]) {
      expect(mutatorSeverity[kind]).toBeGreaterThan(0)
    }

    expect(mutatorSeverity.LowOxygen).toBeLessThan(mutatorSeverity.DuckAndCover)
  })

  it('keeps severities unique so the ladder alone decides the order', () => {
    const severities = Object.values(mutatorSeverity)

    expect(new Set(severities).size).toBe(severities.length)
  })

  it('keeps every warning ahead of every anomaly on the ladder', () => {
    const highestWarning = Math.max(...warningKinds.map((kind) => mutatorSeverity[kind]))
    const lowestAnomaly = Math.min(...anomalyKinds.map((kind) => mutatorSeverity[kind]))

    expect(highestWarning).toBeLessThan(lowestAnomaly)
  })
})
