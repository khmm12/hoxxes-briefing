import type {
  DeepDiveAnomaly,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
} from '~/shared/api'

export type PrimaryObjectiveKind = DeepDivePrimaryObjective['kind']
export type SecondaryObjectiveKind = DeepDiveSecondaryObjective['kind']

export type Mutator =
  | {
      kind: 'anomaly'
      value: DeepDiveAnomaly
    }
  | {
      kind: 'warning'
      value: DeepDiveWarning
    }

// The Rundown attention order is independent of Intel Difficulty.
// Warnings precede Anomalies; these numbers never grade a Mission.
export const mutatorSeverity = {
  HauntedCave: 10,
  LowOxygen: 20,
  DuckAndCover: 30,
  ShieldDisruption: 40,
  EliteThreat: 50,
  LethalEnemies: 60,
  MacteraPlague: 70,
  RivalPresence: 80,
  CaveLeechCluster: 90,
  ExploderInfestation: 100,
  RegenerativeBugs: 110,
  EboniteOutbreak: 120,
  PitJawColony: 130,
  ScrabNestingGrounds: 140,
  Parasites: 150,
  Swarmageddon: 160,
  BloodSugar: 210,
  VolatileGuts: 220,
  CriticalWeakness: 230,
  LowGravity: 240,
  RichAtmosphere: 250,
} satisfies Record<DeepDiveWarning | DeepDiveAnomaly, number>

export function compareMutatorSeverity(left: Mutator, right: Mutator): number {
  const severityDelta = mutatorSeverity[left.value] - mutatorSeverity[right.value]

  return severityDelta === 0 ? left.value.localeCompare(right.value) : severityDelta
}
