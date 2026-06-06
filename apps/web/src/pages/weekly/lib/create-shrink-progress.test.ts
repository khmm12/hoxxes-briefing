import { describe, expect, it } from 'vitest'
import { computeWindowProgress } from './create-shrink-progress'

describe('computeWindowProgress', () => {
  it('is linear inside the window and clamped outside', () => {
    expect(computeWindowProgress(100, 165, 48)).toBe(0)
    expect(computeWindowProgress(165, 165, 48)).toBe(0)
    expect(computeWindowProgress(189, 165, 48)).toBe(0.5)
    expect(computeWindowProgress(213, 165, 48)).toBe(1)
    expect(computeWindowProgress(500, 165, 48)).toBe(1)
  })

  it('clamps rubber-band overscroll ahead of a window starting at the page top', () => {
    expect(computeWindowProgress(-40, 0, 48)).toBe(0)
  })
})
