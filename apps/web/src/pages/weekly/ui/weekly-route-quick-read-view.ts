import type { QuickReadChip } from '../model/weekly-route-quick-read'

export type VisibleQuickReadChips = {
  overflowCount: number
  visible: QuickReadChip[]
}

export function getVisibleQuickReadChips(
  chips: readonly QuickReadChip[],
  visibleLimit: number,
  expanded: boolean,
): VisibleQuickReadChips {
  const normalizedLimit = Math.max(0, visibleLimit)
  const overflowCount = Math.max(0, chips.length - normalizedLimit)

  return {
    overflowCount,
    visible: expanded ? [...chips] : chips.slice(0, normalizedLimit),
  }
}
