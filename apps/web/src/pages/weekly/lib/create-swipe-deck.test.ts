import { describe, expect, it } from 'vitest'
import { computeVelocity, resolveTargetIndex } from './create-swipe-deck'

describe('resolveTargetIndex', () => {
  it('settles to the nearest slide on a slow release', () => {
    expect(resolveTargetIndex(0.4, 0.1, 2)).toBe(0)
    expect(resolveTargetIndex(0.6, -0.1, 2)).toBe(1)
  })

  it('advances in the flick direction even from a short drag', () => {
    // Finger moving left (negative velocity) goes forward.
    expect(resolveTargetIndex(0.1, -0.5, 2)).toBe(1)
    // Finger moving right returns even when past the midpoint.
    expect(resolveTargetIndex(0.9, 0.5, 2)).toBe(0)
  })

  it('clamps to the deck bounds', () => {
    // Rubber-banded past the last slide, flicking forward.
    expect(resolveTargetIndex(1.2, -0.5, 2)).toBe(1)
    // Rubber-banded before the first slide, flicking back.
    expect(resolveTargetIndex(-0.2, 0.5, 2)).toBe(0)
  })
})

describe('computeVelocity', () => {
  it('reads the recent gesture, ignoring stale samples', () => {
    const samples = [
      { x: 0, t: 0 },
      { x: 300, t: 950 },
      { x: 280, t: 1000 },
    ]
    // The 0ms sample is outside the 100ms window: velocity must come from
    // the last 50ms (moving left), not the whole drag (moving right).
    expect(computeVelocity(samples, 1000)).toBeLessThan(0)
  })

  it('returns zero when the finger rested before release', () => {
    expect(computeVelocity([{ x: 120, t: 500 }], 1000)).toBe(0)
    expect(computeVelocity([], 1000)).toBe(0)
  })
})
