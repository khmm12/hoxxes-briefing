import type { RundownChip } from '../../model/dive-rundown'

export type VisibleRundownChips = {
  overflowCount: number
  visible: RundownChip[]
}

export function getVisibleRundownChips(
  chips: readonly RundownChip[],
  visibleLimit: number,
  expanded: boolean,
): VisibleRundownChips {
  const normalizedLimit = Math.max(0, visibleLimit)
  const overflowCount = Math.max(0, chips.length - normalizedLimit)

  return {
    overflowCount,
    visible: expanded ? [...chips] : chips.slice(0, normalizedLimit),
  }
}
