import type { DeepDive } from '~/shared/api'
import { compareMutatorSeverity, type Mutator } from './catalog'

export function buildDiveRundown(dive: DeepDive): Mutator[] {
  const mutators: Mutator[] = [
    ...uniquePresent(dive.missions.map((mission) => mission.warning)).map((value) => ({
      kind: 'warning' as const,
      value,
    })),
    ...uniquePresent(dive.missions.map((mission) => mission.anomaly)).map((value) => ({
      kind: 'anomaly' as const,
      value,
    })),
  ]

  return mutators.sort(compareMutatorSeverity)
}

function uniquePresent<T>(values: ReadonlyArray<T | null>): T[] {
  return [...new Set(values.filter((value): value is T => value != null))]
}
