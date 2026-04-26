import { describe, expect, it } from 'vitest'
import { getCurrentWeeklyCycleId, selectWeeklySlogan, type WeeklySloganPool } from './weekly-slogan'

const pool: WeeklySloganPool<string> = {
  defaultSafe: ['Rock and Stone!', 'For Karl!'],
  rare: ['Danger. Darkness. Dwarves.'],
  secondary: ['Locked and loaded!', 'Hold the line.'],
}

describe('selectWeeklySlogan', () => {
  it('selects the same slogan for the same week key', () => {
    expect(selectWeeklySlogan(pool, '2026.17')).toBe(selectWeeklySlogan(pool, '2026.17'))
  })

  it('returns undefined when every slogan category is empty', () => {
    expect(
      selectWeeklySlogan(
        {
          defaultSafe: [],
          rare: [],
          secondary: [],
        },
        '2026.17',
      ),
    ).toBeUndefined()
  })
})

describe('getCurrentWeeklyCycleId', () => {
  it('uses the previous Thursday cycle before the 11:00 UTC rollover', () => {
    expect(getCurrentWeeklyCycleId(new Date('2026-04-23T10:59:00.000Z'))).toBe('2026.16')
  })

  it('uses the new Thursday cycle after the 11:00 UTC rollover', () => {
    expect(getCurrentWeeklyCycleId(new Date('2026-04-23T11:00:00.000Z'))).toBe('2026.17')
  })
})
