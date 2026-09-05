import { describe, expect, it } from 'vitest'
import type { DeepDiveAnomaly, DeepDiveWarning } from '~/shared/api'
import { mutatorSeverity } from './catalog'

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
  Expect<Equal<DeepDiveWarning, (typeof warningKinds)[number]>>,
  Expect<Equal<DeepDiveAnomaly, (typeof anomalyKinds)[number]>>,
] = [true, true]

void typeCoverageAssertions

describe('domain catalog', () => {
  it('orders every current mutator on the single severity ladder', () => {
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
