import { describe, expect, it } from 'vitest'
import type { RundownChip } from '../model/dive-rundown'
import { getVisibleRundownChips } from './dive-rundown-view'

describe('getVisibleRundownChips', () => {
  it('keeps hidden chips behind an overflow count until expanded', () => {
    const chips: RundownChip[] = [
      { kind: 'warning', value: 'LowOxygen' },
      { kind: 'warning', value: 'DuckAndCover' },
      { kind: 'anomaly', value: 'VolatileGuts' },
      { kind: 'anomaly', value: 'RichAtmosphere' },
    ]

    expect(getVisibleRundownChips(chips, 2, false)).toEqual({
      overflowCount: 2,
      visible: chips.slice(0, 2),
    })

    expect(getVisibleRundownChips(chips, 2, true)).toEqual({
      overflowCount: 2,
      visible: chips,
    })
  })
})
