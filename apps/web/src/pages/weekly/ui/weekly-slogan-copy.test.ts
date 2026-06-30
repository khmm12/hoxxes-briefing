import { describe, expect, it } from 'vitest'
import { createTestI18n } from '~test/render'
import { getWeeklySlogan } from './weekly-slogan-copy'

const knownSlogans = [
  'Rock and Stone!',
  'For Karl!',
  'Karl Would Be Proud!',
  'Rock and Stone, Brother!',
  'Locked and loaded!',
  'Brotherhood. Danger. Profit.',
  'Danger. Darkness. Dwarves.',
  'Leave no dwarf behind.',
  "If you Rock and Stone, you're never alone.",
  'Darkness, here I come!',
  'I eat rock for breakfast!',
  "Let's play this smart for once, huh?",
  'Just show me where to shoot!',
]

describe('getWeeklySlogan', () => {
  it('returns a known slogan in the active locale', () => {
    const i18n = createTestI18n()

    expect(knownSlogans).toContain(getWeeklySlogan(i18n, 'week-1'))
  })

  it('is deterministic for the same week id', () => {
    const i18n = createTestI18n()

    expect(getWeeklySlogan(i18n, 'week-42')).toBe(getWeeklySlogan(i18n, 'week-42'))
  })

  it('varies across week ids', () => {
    const i18n = createTestI18n()

    const slogans = new Set(Array.from({ length: 20 }, (_, index) => getWeeklySlogan(i18n, `week-${index}`)))

    expect(slogans.size).toBeGreaterThan(1)
  })
})
