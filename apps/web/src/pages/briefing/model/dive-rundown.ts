import type { DeepDive, DeepDiveAnomaly, DeepDiveWarning } from '~/shared/api'
import { compareAnomaliesForRundown, compareWarningsForRundown } from './catalog'

export type RundownChip =
  | {
      kind: 'anomaly'
      value: DeepDiveAnomaly
    }
  | {
      kind: 'warning'
      value: DeepDiveWarning
    }

export function buildRundownChips(dive: DeepDive): RundownChip[] {
  const warnings = uniquePresent(dive.missions.map((mission) => mission.warning)).sort(compareWarningsForRundown)
  const anomalies = uniquePresent(dive.missions.map((mission) => mission.anomaly)).sort(compareAnomaliesForRundown)
  const chips: RundownChip[] = [
    ...warnings.map((warning) => ({ kind: 'warning' as const, value: warning })),
    ...anomalies.map((anomaly) => ({ kind: 'anomaly' as const, value: anomaly })),
  ]

  return chips
}

function uniquePresent<T>(values: ReadonlyArray<T | null>): T[] {
  return [...new Set(values.filter((value): value is T => value != null))]
}
