import { describe, expect, it } from 'vitest'
import type { QuickReadChip } from '../model/weekly-route-quick-read'
import { getVisibleQuickReadChips } from './weekly-route-quick-read-view'

describe('getVisibleQuickReadChips', () => {
  it('keeps hidden chips behind an overflow count until expanded', () => {
    const chips: QuickReadChip[] = [
      { kind: 'warning', value: 'LowOxygen' },
      { kind: 'warning', value: 'DuckAndCover' },
      { kind: 'mutator', value: 'VolatileGuts' },
      { kind: 'mutator', value: 'RichAtmosphere' },
    ]

    expect(getVisibleQuickReadChips(chips, 2, false)).toEqual({
      overflowCount: 2,
      visible: chips.slice(0, 2),
    })

    expect(getVisibleQuickReadChips(chips, 2, true)).toEqual({
      overflowCount: 2,
      visible: chips,
    })
  })
})
