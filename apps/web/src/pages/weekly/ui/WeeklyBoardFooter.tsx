import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'

const footerStyles = css.raw({
  marginTop: '4',
  color: 'text.muted',
  textStyle: 'body.sm',
  textAlign: 'center',
})

const footerLinkStyles = css.raw({
  color: 'inherit',
  textDecorationLine: 'underline',
  textDecorationColor: 'transparent',
  textDecorationThickness: '1px',
  textUnderlineOffset: '0.18em',
  transitionDuration: 'press',
  transitionProperty: '[color, text-decoration-color]',
  transitionTimingFunction: 'press',
  _hover: {
    color: 'text.secondary',
    textDecorationColor: 'current',
  },
  _focusVisible: {
    borderRadius: 'sm',
    layerStyle: 'focusRing',
  },
})

export function WeeklyBoardFooter(): JSX.Element {
  const i18n = useI18n()

  return (
    <footer class={css(footerStyles)}>
      {i18n._(msg`Rock and Stone, Miner!`)}
      <br />
      {i18n._(msg`Made with love by`)}{' '}
      <a class={css(footerLinkStyles)} href="https://github.com/khmm12" target="_blank" rel="noopener noreferrer">
        khmm12
      </a>{' '}
      ❤️
      <br />
      <a
        class={css(footerLinkStyles)}
        href="https://github.com/khmm12/hoxxes-briefing"
        target="_blank"
        rel="noopener noreferrer"
      >
        {i18n._(msg`Source on GitHub`)}
      </a>
    </footer>
  )
}
