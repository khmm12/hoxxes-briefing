import { describe, expect, it } from 'vitest'
import { createTestI18n } from '~test/render'
import { getSlogan } from './slogan-copy'

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

describe('getSlogan', () => {
  it('returns a known slogan in the active locale', () => {
    const i18n = createTestI18n()

    expect(knownSlogans).toContain(getSlogan(i18n, 1))
  })

  it('is deterministic for the same seed', () => {
    const i18n = createTestI18n()

    expect(getSlogan(i18n, 42)).toBe(getSlogan(i18n, 42))
  })

  it('varies across seeds', () => {
    const i18n = createTestI18n()

    const slogans = new Set(Array.from({ length: 20 }, (_, index) => getSlogan(i18n, index)))

    expect(slogans.size).toBeGreaterThan(1)
  })
})
