import { msg } from '@lingui/core/macro'
import { For, type JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import type { WeeklySnapshotResult } from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { createBreakpointQuery } from '~/shared/lib/create-media-query'
import { createSwipeDeck } from '../lib/create-swipe-deck'
import { WeeklyRouteSlab } from './WeeklyRouteSlab'
import { formatDiveKind } from './weekly-dive-copy'

type DiveKind = 'elite' | 'normal'

type WeeklyRouteDeckProps = {
  dives: WeeklySnapshotResult['dives']
  expired: boolean
}

const DIVE_KINDS = ['normal', 'elite'] as const satisfies readonly DiveKind[]

const deckStyles = css.raw({
  display: 'grid',
  gap: 'ui12',
  marginTop: 'ui12',
})

const switchStyles = css.raw({
  display: { base: 'grid', lg: 'none' },
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 'ui8',
  margin: '0',
  padding: '0',
  borderWidth: '0',
  minWidth: '0',
})

const switchChipRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'control.compact',
    paddingBlock: 'ui8',
    paddingInline: 'ui12',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.subtle',
    borderRadius: 'ui8',
    background: 'transparent',
    color: 'text.secondary',
    textStyle: 'display.control',
    cursor: 'pointer',
    _focusVisible: {
      layerStyle: 'focusRing',
    },
  },
  variants: {
    kind: {
      normal: {
        _current: {
          borderColor: 'brand.border',
          background: 'brand.surface',
          color: 'brand.hover',
        },
      },
      elite: {
        _current: {
          borderColor: 'danger.border',
          background: 'danger.surface',
          color: 'danger',
        },
      },
    },
  },
  defaultVariants: {
    kind: 'normal',
  },
})

// Transform deck on mobile: the viewport clips the translated track, and
// `pan-y` keeps vertical page scrolling native so flicks down never get
// captured by the deck (see create-swipe-deck for the gesture physics).
const viewportStyles = css.raw({
  overflow: { base: 'hidden', lg: 'visible' },
  touchAction: '[pan-y]',
})

const trackStyles = css.raw({
  display: 'grid',
  gap: 'ui12',
  gridAutoFlow: { base: 'column', lg: 'row' },
  gridAutoColumns: '[100%]',
  gridTemplateColumns: { lg: 'repeat(2, minmax(0, 1fr))' },
  alignItems: 'stretch',
  willChange: { base: '[transform]', lg: 'auto' },
})

export function WeeklyRouteDeck(props: WeeklyRouteDeckProps): JSX.Element {
  const i18n = useI18n()
  const isWide = createBreakpointQuery('lg')
  // One slide at a time below lg: gestures live, the inactive slab inert.
  const stacked = () => !isWide()
  const deck = createSwipeDeck(DIVE_KINDS, stacked)

  return (
    <section aria-label={i18n._(msg`Deep dive mission board`)} class={css(deckStyles)}>
      <fieldset aria-label={i18n._(msg`Dive routes`)} class={css(switchStyles)}>
        {DIVE_KINDS.map((kind) => (
          <button
            aria-current={deck.active() === kind ? 'true' : undefined}
            class={css(switchChipRecipe.raw({ kind }))}
            type="button"
            onClick={() => deck.pick(kind)}
          >
            {formatDiveKind(i18n, kind)}
          </button>
        ))}
      </fieldset>
      <div class={css(viewportStyles)} ref={deck.attachViewport}>
        <div class={css(trackStyles)} ref={deck.attachTrack}>
          <For each={DIVE_KINDS}>
            {(kind) => (
              <WeeklyRouteSlab
                inert={stacked() && deck.active() !== kind}
                dive={props.dives[kind]}
                expired={props.expired}
                kind={kind}
              />
            )}
          </For>
        </div>
      </div>
    </section>
  )
}
