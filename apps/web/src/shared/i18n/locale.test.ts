import { describe, expect, it } from 'vitest'
import { defaultLocale, resolveLocale } from '~/shared/i18n'

describe('resolveLocale', () => {
  it('uses english and falls back to the default locale otherwise', () => {
    expect(resolveLocale(['en-US', 'ru-RU'])).toBe('en-US')
    expect(resolveLocale(['de-DE', 'fr-FR'])).toBe(defaultLocale)
  })
})
