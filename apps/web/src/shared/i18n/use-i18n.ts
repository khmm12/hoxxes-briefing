import type { I18n } from '@lingui/core'
import { useContext } from 'solid-js'
import { I18nContext } from './i18n-context'

export function useI18n(): I18n {
  const context = useContext(I18nContext)

  if (context == null) {
    throw new Error('useI18n must be used within an I18nProvider')
  }

  return context.i18n
}

export default useI18n
