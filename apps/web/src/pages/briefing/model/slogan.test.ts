import { describe, expect, it } from 'vitest'
import { type SloganPool, selectSlogan } from './slogan'

const pool: SloganPool<string> = {
  defaultSafe: ['Rock and Stone!', 'For Karl!'],
  rare: ['Danger. Darkness. Dwarves.'],
  secondary: ['Locked and loaded!', 'Hold the line.'],
}

describe('selectSlogan', () => {
  it('selects the same slogan for the same seed', () => {
    expect(selectSlogan(pool, 42)).toBe(selectSlogan(pool, 42))
  })

  it('always returns a phrase from the pool, including for large seeds', () => {
    const allPhrases = [...pool.defaultSafe, ...pool.rare, ...pool.secondary]

    for (const seed of [0, 1, 7, 42, 1000, 0x7fffffff, 0xffffffff]) {
      expect(allPhrases).toContain(selectSlogan(pool, seed))
    }
  })

  it('throws when every slogan category is empty', () => {
    expect(() =>
      selectSlogan(
        {
          defaultSafe: [],
          rare: [],
          secondary: [],
        },
        42,
      ),
    ).toThrow('slogan pool should not be empty')
  })
})
