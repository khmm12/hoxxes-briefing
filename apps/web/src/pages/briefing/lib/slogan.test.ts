import { describe, expect, it } from 'vitest'
import { type SloganPool, selectSlogan } from './slogan'

const pool: SloganPool<string> = [
  'Rock and Stone!',
  'For Karl!',
  'Danger. Darkness. Dwarves.',
  'Locked and loaded!',
  'Hold the line.',
]

describe('selectSlogan', () => {
  it('selects the same slogan for the same seed', () => {
    expect(selectSlogan(pool, 42)).toBe(selectSlogan(pool, 42))
  })

  it('always returns a phrase from the pool, including for large seeds', () => {
    for (const seed of [0, 1, 7, 42, 1000, 0x7fffffff, 0xffffffff]) {
      expect(pool).toContain(selectSlogan(pool, seed))
    }
  })

  it('throws when the pool is empty', () => {
    expect(() => selectSlogan([], 42)).toThrow('slogan pool should not be empty')
  })
})
