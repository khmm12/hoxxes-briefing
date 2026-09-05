import { describe, expect, it } from 'vitest'
import { setupI18n } from '@lingui/core'
import { createTestI18n } from '~test/render'
import { formatDifficulty, formatDifficultyAssessment, formatDifficultyLevel } from './difficulty-copy'

describe('difficulty copy', () => {
  it('collapses matching grades while keeping both crews in the accessible Stage description', () => {
    const i18n = createTestI18n()
    expect(formatDifficulty(i18n, 'Easy', 'Easy')).toBe('Easy')
    expect(formatDifficultyAssessment(i18n, 'Easy', 'Easy', 1)).toBe('Stage 1: Easy for 1–2 miners and 3–4 miners.')
  })

  it('preserves both crew conditions in the share assessment without semicolons', () => {
    expect(formatDifficulty(createTestI18n(), 'Brutal', 'Demanding')).toBe(
      'Brutal for 1–2 miners. Demanding for 3–4 miners.',
    )
  })

  it('localizes the level and assessment through the supplied service', () => {
    const translated = setupI18n({
      locale: 'test',
      messages: { test: {} },
      missing: (_locale, id) => `translated:${id}`,
    })
    expect(formatDifficultyLevel(translated, 'Brutal')).toMatch(/^translated:/)
    expect(formatDifficulty(translated, 'Brutal', 'Demanding')).toMatch(/^translated:/)
    expect(formatDifficultyAssessment(translated, 'Brutal', 'Demanding', 1)).toMatch(/^translated:/)
  })
})
