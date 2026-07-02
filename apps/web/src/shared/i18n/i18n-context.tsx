import { type Accessor, createContext, createEffect, createSignal, useContext } from 'solid-js'
import type { I18n } from '@lingui/core'
import type { JSX } from '@solidjs/web'

type LinguiProviderProps = {
  children?: JSX.Element
  i18n: I18n
}

type I18nContextValue = { i18n: I18n }

const I18nContext = /* @__PURE__ */ createContext<I18nContextValue>()

export function I18nProvider(props: LinguiProviderProps): JSX.Element {
  const i18n = createI18n(() => props.i18n)

  const ctx: I18nContextValue = { i18n }

  return <I18nContext value={ctx}>{props.children}</I18nContext>
}

export function useI18n(): I18n {
  return useContext(I18nContext).i18n
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
