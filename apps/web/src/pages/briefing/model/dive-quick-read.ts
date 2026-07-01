import type { DeepDive, DeepDiveAnomaly, DeepDiveWarning } from '~/shared/api'
import { compareAnomaliesForQuickRead, compareWarningsForQuickRead } from './catalog'

export type QuickReadChip =
  | {
      kind: 'anomaly'
      value: DeepDiveAnomaly
    }
  | {
      kind: 'warning'
      value: DeepDiveWarning
    }

export function buildQuickReadChips(dive: DeepDive): QuickReadChip[] {
  const warnings = uniquePresent(dive.missions.map((mission) => mission.warning)).sort(compareWarningsForQuickRead)
  const anomalies = uniquePresent(dive.missions.map((mission) => mission.anomaly)).sort(compareAnomaliesForQuickRead)
  const chips: QuickReadChip[] = [
    ...warnings.map((warning) => ({ kind: 'warning' as const, value: warning })),
    ...anomalies.map((anomaly) => ({ kind: 'anomaly' as const, value: anomaly })),
  ]

  return chips
}

function uniquePresent<T>(values: ReadonlyArray<T | null>): T[] {
  return [...new Set(values.filter((value): value is T => value != null))]
}
