import { msg } from '@lingui/core/macro'
import type { JSX } from 'solid-js'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'

const footerStyles = css.raw({
  marginTop: 'ui16',
  color: 'text.disabled',
  fontSize: '0.875rem',
  lineHeight: '1.55',
  whiteSpace: 'pre-line',
  textAlign: 'center',
})

export function WeeklyBoardFooter(): JSX.Element {
  const i18n = useI18n()

  return (
    <footer class={css(footerStyles)}>
      {i18n._(msg`Rock and Stone, Miner! Made with love by khmm12 ❤️`)}
      {'\n'}
      {i18n._(msg`If you'd like to support my work, buy me a beer. 🍻`)}
    </footer>
  )
}
