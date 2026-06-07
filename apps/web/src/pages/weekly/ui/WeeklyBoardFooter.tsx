import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'

const footerStyles = css.raw({
  marginTop: { base: '6', md: '8' },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '2',
  color: 'text.muted',
  textStyle: 'body.sm',
  textAlign: 'center',
})

// Full-bleed on mobile so the hazard bands reach the screen edge, matching the
// header divider treatment; on desktop the content column already fills the board.
const saluteRowStyles = css.raw({
  display: 'flex',
  alignItems: 'center',
  gap: '6',
  marginInline: { base: '[calc(var(--layout-inline-padding) * -1)]', md: '0' },
})

// Decorative gold hazard-stripe band. The stripe color rides on `color` so a
// single `currentColor` gradient serves both sides; the right band mirrors it
// via scaleX. Stop widths are measured along the gradient axis (perpendicular
// to the 45° stripes), so they read narrower than the stripe's on-screen pitch.
const hazardBandStyles = css.raw({
  flex: '1',
  height: '2',
  minWidth: '0',
  color: 'primary/35',
  backgroundImage:
    '[repeating-linear-gradient(-45deg, currentColor 0, currentColor 5px, transparent 5px, transparent 11px)]',
  overflow: 'hidden',
})

const saluteStyles = css.raw({
  flexShrink: '0',
  textStyle: 'display.lg',
  color: 'primary',
  whiteSpace: 'nowrap',
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
      <div class={css(saluteRowStyles)}>
        <span class={css(hazardBandStyles)} aria-hidden="true" />
        <span class={css(saluteStyles)}>{i18n._(msg`Rock and Stone!`)}</span>
        <span class={css(hazardBandStyles, { transform: 'scaleX(-1)' })} aria-hidden="true" />
      </div>
      <p>
        {i18n._(msg`Made with love by`)}{' '}
        <a class={css(footerLinkStyles)} href="https://github.com/khmm12" target="_blank" rel="noopener noreferrer">
          khmm12
        </a>{' '}
        ❤️ ·{' '}
        <a
          class={css(footerLinkStyles)}
          href="https://github.com/khmm12/hoxxes-briefing"
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n._(msg`Source on GitHub`)}
        </a>
      </p>
    </footer>
  )
}
