import { describe, expect, it } from 'vitest'
import { renderHook } from '@solidjs/testing-library'
import { useI18n } from './use-i18n'

describe('useI18n', () => {
  it('throws when used outside of an I18nProvider', () => {
    expect(() => renderHook(useI18n)).toThrow('useI18n must be used within an I18nProvider')
  })
})
