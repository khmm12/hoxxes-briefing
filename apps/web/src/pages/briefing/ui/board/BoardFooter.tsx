import { type Accessor, createSignal, For, onSettled, Show } from 'solid-js'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import { createMediaQuery } from '~/shared/lib/create-media-query'

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

// Full-bleed on mobile so the mutator bands reach the screen edge, matching the
// header divider treatment; on desktop the content column already fills the board.
const saluteRowStyles = css.raw({
  display: 'flex',
  alignItems: 'center',
  gap: '6',
  marginInline: { base: '[calc(var(--layout-inline-padding) * -1)]', md: '0' },
})

// Decorative gold mutator-stripe band. The stripe color rides on `color` so a
// single `currentColor` gradient serves both sides; the right band mirrors it
// via scaleX. Stop widths are measured along the gradient axis (perpendicular
// to the 45° stripes), so they read narrower than the stripe's on-screen pitch.
const mutatorBandStyles = css.raw({
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

// The glyph is inline-block so the scale transform takes; clicking the tip link
// swaps in the cheering class for one play. Two precomputed classes rather than
// a runtime merge so the animation-style utility resolves at build time.
const beerRestingClass = css({ display: 'inline-block' })
const beerCheeringClass = css({ display: 'inline-block', animationStyle: 'cheers' })

const burstStyles = css.raw({ position: 'relative', display: 'inline-block' })

// Gold spark that flies out from the mug; --tx/--ty carry its direction. Base
// opacity is 0 so it stays invisible before/without the animation (reduced
// motion, initial frame).
const sparkStyles = css.raw({
  position: 'absolute',
  top: '[50%]',
  left: '[50%]',
  width: '1.5',
  height: '1.5',
  borderRadius: 'full',
  background: 'primary',
  opacity: 'transparent',
  pointerEvents: 'none',
  animationStyle: 'cheersSpark',
})

// Ten sparks fanned around the mug, biased upward like a real burst. Fixed
// directions (not random) so the burst reads as designed, not noisy; the
// staggered delays spread the ~0.9s loop into a continuous fountain.
const SPARKS: ReadonlyArray<{ x: string; y: string; delay: string }> = [
  { x: '0rem', y: '-2.25rem', delay: '0ms' },
  { x: '0.9rem', y: '-2rem', delay: '90ms' },
  { x: '1.7rem', y: '-1.2rem', delay: '180ms' },
  { x: '2.1rem', y: '-0.2rem', delay: '270ms' },
  { x: '1.6rem', y: '0.9rem', delay: '360ms' },
  { x: '-0.9rem', y: '-2rem', delay: '450ms' },
  { x: '-1.7rem', y: '-1.2rem', delay: '540ms' },
  { x: '-2.1rem', y: '-0.2rem', delay: '630ms' },
  { x: '-1.6rem', y: '0.9rem', delay: '720ms' },
  { x: '0rem', y: '1.4rem', delay: '810ms' },
]

export function BoardFooter(): JSX.Element {
  const i18n = useI18n()
  const cheer = createTipCheer()

  return (
    <footer class={css(footerStyles)}>
      <div class={css(saluteRowStyles)}>
        <span class={css(mutatorBandStyles)} aria-hidden="true" />
        <span class={css(saluteStyles)}>{i18n._(msg`Rock and Stone!`)}</span>
        <span class={css(mutatorBandStyles, { transform: 'scaleX(-1)' })} aria-hidden="true" />
      </div>
      <p>
        {i18n._(msg`Made with love by`)}{' '}
        <a class={css(footerLinkStyles)} href="https://github.com/khmm12" target="_blank" rel="noopener noreferrer">
          khmm12
        </a>{' '}
        ❤️
      </p>
      <p>
        <a
          class={css(footerLinkStyles)}
          href="https://github.com/khmm12/hoxxes-briefing"
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n._(msg`Source on GitHub`)}
        </a>{' '}
        ·{' '}
        <a
          class={css(footerLinkStyles)}
          href="https://ko-fi.com/khmm12"
          target="_blank"
          rel="noopener noreferrer"
          onClick={cheer.onTip}
        >
          {i18n._(msg`Buy me a Blackout Stout`)}
        </a>{' '}
        <span class={css(burstStyles)}>
          <span class={cheer.cheering() ? beerCheeringClass : beerRestingClass} onAnimationEnd={cheer.onCheerEnd}>
            🍺
          </span>
          <Show when={cheer.cheering()}>
            <For each={SPARKS}>
              {(spark) => (
                <span
                  aria-hidden="true"
                  class={css(sparkStyles)}
                  style={{ '--tx': spark.x, '--ty': spark.y, 'animation-delay': spark.delay }}
                />
              )}
            </For>
          </Show>
        </span>
      </p>
    </footer>
  )
}

type TipCheer = {
  cheering: Accessor<boolean>
  onTip: () => void
  onCheerEnd: () => void
}

// The tip link opens Ko-fi in a new tab, so the cheer fired on click is usually
// missed. Remember the click and replay the glyph when the page comes back into
// view — unless the play already finished on-screen (onCheerEnd clears it).
function createTipCheer(): TipCheer {
  const [cheering, setCheering] = createSignal(false)
  // Under reduced motion the glyph never animates, so `animationend` never fires
  // to reset the state — skip the whole cheer instead of latching it forever.
  const reducedMotion = createMediaQuery('(prefers-reduced-motion: reduce)')
  let replayOnReturn = false

  onSettled(() => {
    const replayWhenVisible = (): void => {
      if (document.visibilityState === 'visible' && replayOnReturn) {
        replayOnReturn = false
        setCheering(true)
      }
    }
    document.addEventListener('visibilitychange', replayWhenVisible)
    return () => document.removeEventListener('visibilitychange', replayWhenVisible)
  })

  return {
    cheering,
    onTip(): void {
      if (reducedMotion()) return
      replayOnReturn = true
      setCheering(true)
    },
    onCheerEnd(): void {
      setCheering(false)
      if (document.visibilityState === 'visible') replayOnReturn = false
    },
  }
}
