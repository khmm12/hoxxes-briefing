import { afterEach, describe, expect, it, vi } from 'vitest'
import { messages as enMessages } from '~/shared/i18n/locales/en/messages.po'

// `locale` is resolved from navigator.languages at module-eval time, so each
// case stubs navigator and re-imports the module fresh to pick it up.
describe('createAppI18n', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('resolves and activates an I18n for a supported browser language', async () => {
    vi.stubGlobal('navigator', { languages: ['en-US'] })
    const { createAppI18n } = await import('./config')

    const i18n = await createAppI18n()

    expect(i18n.locale).toBe('en-US')
    expect(i18n.messages).toBe(enMessages)
  })

  it('falls back to the default locale for an unsupported browser language', async () => {
    vi.stubGlobal('navigator', { languages: ['de-DE'] })
    const { createAppI18n } = await import('./config')

    const i18n = await createAppI18n()

    expect(i18n.locale).toBe('en-US')
  })
})
