import { describe, expect, it } from 'vitest'
import { selectWeeklySlogan, type WeeklySloganPool } from './weekly-slogan'

const pool: WeeklySloganPool<string> = {
  defaultSafe: ['Rock and Stone!', 'For Karl!'],
  rare: ['Danger. Darkness. Dwarves.'],
  secondary: ['Locked and loaded!', 'Hold the line.'],
}

describe('selectWeeklySlogan', () => {
  it('selects the same slogan for the same week key', () => {
    expect(selectWeeklySlogan(pool, '2026.17')).toBe(selectWeeklySlogan(pool, '2026.17'))
  })

  it('throws when every slogan category is empty', () => {
    expect(() =>
      selectWeeklySlogan(
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
