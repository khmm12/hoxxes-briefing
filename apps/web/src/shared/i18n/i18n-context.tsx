import type { I18n } from '@lingui/core'
import { type Accessor, createContext, createEffect, createSignal, type JSX } from 'solid-js'

type LinguiProviderProps = {
  children?: JSX.Element
  i18n: I18n
}

export type I18nContextValue = { i18n: I18n }

export const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider(props: LinguiProviderProps): JSX.Element {
  const i18n = createI18n(() => props.i18n)

  const ctx: I18nContextValue = { i18n }

  return <I18nContext value={ctx}>{props.children}</I18nContext>
}

function createI18n(i18n: Accessor<I18n>): I18n {
  const [signal, setSignal] = createSignal(0)

  createEffect(i18n, (i18n) => {
    const handleChange = () => setSignal((value) => value + 1)

    const unsubscribe = i18n.on('change', handleChange)
    return unsubscribe
  })

  return new Proxy(i18n(), {
    get(_, prop) {
      signal()

      return Reflect.get(i18n(), prop)
    },
  })
}

export default I18nProvider
