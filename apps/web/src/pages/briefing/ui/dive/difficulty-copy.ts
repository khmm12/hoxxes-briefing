import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'

export type DifficultyLevel = 'Easy' | 'Manageable' | 'Demanding' | 'Brutal'

export function formatDifficultyLevel(i18n: I18n, level: DifficultyLevel): string {
  switch (level) {
    case 'Easy':
      return i18n._(msg`Easy`)
    case 'Manageable':
      return i18n._(msg`Manageable`)
    case 'Demanding':
      return i18n._(msg`Demanding`)
    case 'Brutal':
      return i18n._(msg`Brutal`)
  }
}

export function formatDifficulty(i18n: I18n, smallLevel: DifficultyLevel, fullLevel: DifficultyLevel): string {
  if (smallLevel === fullLevel) return formatDifficultyLevel(i18n, smallLevel)

  const small = formatDifficultyLevel(i18n, smallLevel)
  const full = formatDifficultyLevel(i18n, fullLevel)
  return i18n._(msg`${small} for 1–2 miners. ${full} for 3–4 miners.`)
}

export function formatDifficultyAssessment(
  i18n: I18n,
  smallLevel: DifficultyLevel,
  fullLevel: DifficultyLevel,
  stage?: number,
): string {
  if (stage == null) {
    const summary = formatDifficulty(i18n, smallLevel, fullLevel)
    return i18n._(msg`Dive difficulty: ${summary}`)
  }

  const small = formatDifficultyLevel(i18n, smallLevel)
  const full = formatDifficultyLevel(i18n, fullLevel)
  return smallLevel === fullLevel
    ? i18n._(msg`Stage ${stage}: ${small} for 1–2 miners and 3–4 miners.`)
    : i18n._(msg`Stage ${stage}: ${small} for 1–2 miners. ${full} for 3–4 miners.`)
}
