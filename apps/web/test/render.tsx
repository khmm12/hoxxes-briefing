import { type I18n, setupI18n } from '@lingui/core'
import { render } from '@solidjs/testing-library'
import type { JSX } from '@solidjs/web'
import { I18nProvider } from '~/shared/i18n'
import { messages } from '~/shared/i18n/locales/en/messages.po'

// A real en-US catalog so assertions read against the strings the app ships,
// not lingui's source-id fallback.
export function createTestI18n(): I18n {
  return setupI18n({ locale: 'en-US', messages: { 'en-US': messages } })
}

type RenderOptions = {
  i18n?: I18n
}

// Wraps the component under test in the providers every screen assumes
// (currently just i18n). Returns the standard testing-library result.
export function renderWithProviders(ui: () => JSX.Element, options: RenderOptions = {}) {
  const i18n = options.i18n ?? createTestI18n()

  return render(() => <I18nProvider i18n={i18n}>{ui()}</I18nProvider>)
}
