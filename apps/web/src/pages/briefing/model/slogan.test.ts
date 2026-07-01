import { describe, expect, it } from 'vitest'
import { type SloganPool, selectSlogan } from './slogan'

const pool: SloganPool<string> = {
  defaultSafe: ['Rock and Stone!', 'For Karl!'],
  rare: ['Danger. Darkness. Dwarves.'],
  secondary: ['Locked and loaded!', 'Hold the line.'],
}

describe('selectSlogan', () => {
  it('selects the same slogan for the same week key', () => {
    expect(selectSlogan(pool, '2026.17')).toBe(selectSlogan(pool, '2026.17'))
  })

  it('throws when every slogan category is empty', () => {
    expect(() =>
      selectSlogan(
        {
          defaultSafe: [],
          rare: [],
          secondary: [],
        },
        '2026.17',
      ),
    ).toThrow('slogan pool should not be empty')
  })
})
