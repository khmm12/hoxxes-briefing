import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'

const footerStyles = css.raw({
  marginTop: 'ui16',
  color: 'text.disabled',
  fontSize: '0.875rem',
  lineHeight: '1.55',
  textAlign: 'center',
})

const authorLinkStyles = css.raw({
  color: 'inherit',
  textDecorationLine: 'underline',
  textDecorationColor: 'transparent',
  textDecorationThickness: '1px',
  textUnderlineOffset: '0.18em',
  transitionDuration: 'fast',
  transitionProperty: '[color, text-decoration-color]',
  transitionTimingFunction: 'standard',
  _hover: {
    color: 'text.secondary',
    textDecorationColor: 'current',
  },
  _focusVisible: {
    borderRadius: 'ui2',
    layerStyle: 'focusRing',
  },
})

export function WeeklyBoardFooter(): JSX.Element {
  const i18n = useI18n()

  return (
    <footer class={css(footerStyles)}>
      {i18n._(msg`Rock and Stone, Miner! Made with love by`)}{' '}
      <a class={css(authorLinkStyles)} href="https://github.com/khmm12">
        khmm12
      </a>{' '}
      ❤️
    </footer>
  )
}
