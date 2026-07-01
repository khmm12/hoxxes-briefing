import {
  compareWeeklyMutatorsForQuickRead,
  compareWeeklyWarningsForQuickRead,
  type PresentWeeklyMutator,
  type PresentWeeklyWarning,
  type WeeklyDive,
} from './weekly-catalog'

export type QuickReadChip =
  | {
      kind: 'mutator'
      value: PresentWeeklyMutator
    }
  | {
      kind: 'warning'
      value: PresentWeeklyWarning
    }

export function buildQuickReadChips(dive: WeeklyDive): QuickReadChip[] {
  const warnings = uniquePresent(dive.missions.map((mission) => mission.warning)).sort(
    compareWeeklyWarningsForQuickRead,
  )
  const mutators = uniquePresent(dive.missions.map((mission) => mission.mutator)).sort(
    compareWeeklyMutatorsForQuickRead,
  )
  const chips: QuickReadChip[] = [
    ...warnings.map((warning) => ({ kind: 'warning' as const, value: warning })),
    ...mutators.map((mutator) => ({ kind: 'mutator' as const, value: mutator })),
  ]

  return chips
}

function uniquePresent<T>(values: ReadonlyArray<T | null>): T[] {
  return [...new Set(values.filter((value): value is T => value != null))]
}
