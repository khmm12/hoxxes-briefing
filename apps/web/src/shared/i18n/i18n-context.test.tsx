import { describe, expect, it } from 'vitest'
import { flush } from 'solid-js'
import { setupI18n } from '@lingui/core'
import { render, renderHook } from '@solidjs/testing-library'
import { I18nProvider, useI18n } from './i18n-context'

describe('I18nProvider', () => {
  it('re-renders consumers when the wrapped i18n instance emits a change', () => {
    const i18n = setupI18n({ locale: 'en-US', messages: { 'en-US': {}, 'ru-RU': {} } })

    function Probe() {
      const ctxI18n = useI18n()
      return <span>{ctxI18n.locale}</span>
    }

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Probe />
      </I18nProvider>
    ))

    expect(getByText('en-US')).toBeInTheDocument()

    i18n.activate('ru-RU')
    flush()

    expect(getByText('ru-RU')).toBeInTheDocument()
  })
})

describe('useI18n', () => {
  it('throws when used outside of an I18nProvider', () => {
    expect(() => renderHook(useI18n)).toThrow(
      'Context must either be created with a default value or a value must be provided before accessing it.',
    )
  })
})
