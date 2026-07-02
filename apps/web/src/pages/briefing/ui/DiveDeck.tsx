import { createSignal } from 'solid-js'
import { msg } from '@lingui/core/macro'
import { For, type JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import * as v from 'valibot'
import type { Briefing } from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { createLocalStorage } from '~/shared/lib/create-local-storage'
import { createBreakpointQuery } from '~/shared/lib/create-media-query'
import { createShrinkProgress } from '../lib/create-shrink-progress'
import { createSwipeDeck } from '../lib/create-swipe-deck'
import { DiveSlab } from './DiveSlab'
import { formatDiveKind } from './dive-copy'

type DiveKind = 'elite' | 'normal'

type DiveDeckProps = {
  dives: Briefing['dives']
  expired: boolean
}

const DIVE_KINDS = ['normal', 'elite'] as const satisfies readonly DiveKind[]

const DIVE_KIND_STORAGE_KEY = 'dive-kind'
const diveKindSchema = /* @__PURE__ */ v.picklist(DIVE_KINDS)

const deckStyles = css.raw({
  display: 'grid',
  gap: '3',
  marginTop: { base: '3', md: '4' },
  // The shrinking switch reflows content below it; keep Chrome's scroll
  // anchoring from compensating the shift and fighting the scroll-linked
  // progress (Safari has no anchoring).
  overflowAnchor: 'none',
  // How much the pinned switch loses to the collapse — the single source the
  // chip's min-height and the compensation below both read, so a retune can't
  // desync them and silently revive the feedback loop.
  '--shrink-amount': '0.75rem',
  // Reclaim exactly what the bar sheds as it pins, so the document's height
  // never tracks `--shrink-progress`. Without this the page shortens as you
  // scroll into the collapse; at the bottom edge the scroll clamps, progress
  // backs off, and the bar judders between sizes (worst on short overflow —
  // iPad Mini). Holding the height constant lets a too-short page simply not
  // finish the collapse instead of fighting it.
  paddingBottom: '[calc(var(--shrink-amount) * var(--shrink-progress, 0))]',
})

// The switch is the sticky bar: it pins to the viewport top at full size,
// then compresses in step with `--shrink-progress` (set on the deck section
// by createShrinkProgress) over the first px of pinned scrolling — the iOS
// large-title collapse. The opaque backdrop rides the separate
// `--shrink-chrome`, completing on the final approach so content never
// slides under a still-transparent bar.
const switchStyles = css.raw({
  display: { base: 'grid', md: 'none' },
  position: { base: 'sticky', md: 'static' },
  top: '0',
  // Pinned chrome above the slabs (each isolates its own stacking context).
  zIndex: 'sticky',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '2',
  // Constant breathing: invisible at rest (transparent backdrop), and by
  // the pin it guarantees the under-sliding card meets backdrop, never the
  // chips themselves. Interpolating it instead leaves ~1px at the moment
  // the card first reaches the bar. The negative block margin takes the
  // breathing back out of the flow slot, so the section's gap to the card
  // stays as designed; it also makes the border box pin earlier than the
  // section top — create-shrink-progress measures this bleed at activation.
  marginBlock: '-2',
  // Full-bleed backdrop: the deck viewport breaks out to the screen edge, so
  // a pinned bar spanning only the content width leaves the page gutters
  // uncovered — under-sliding cards peek there. Counter the layout padding
  // the same way the viewport does (anything the deck pushes past the screen
  // edge is cut by the layout's overflow: clip anyway), and pad it back so
  // the chips stay on the content grid.
  marginInline: { base: '[calc(-1 * var(--layout-inline-padding))]', md: '0' },
  paddingBlock: '2',
  paddingInline: { base: '[var(--layout-inline-padding)]', md: '0' },
  borderWidth: '0',
  minWidth: '0',
  backgroundColor: '[color-mix(in srgb, token(colors.bg) calc(var(--shrink-chrome, 0) * 100%), transparent)]',
})

const switchChipRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    // control.tab (2.75rem) at rest → 2rem stuck, driven by scroll. The shed
    // height (--shrink-amount) is reclaimed by the deck's padding so the
    // document height stays put.
    minHeight: '[calc(token(sizes.control.tab) - var(--shrink-amount) * var(--shrink-progress, 0))]',
    paddingBlock: '[calc(token(spacing.2) - 0.25rem * var(--shrink-progress, 0))]',
    paddingInline: '3',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.subtle',
    borderRadius: 'md',
    background: 'transparent',
    color: 'text.secondary',
    textStyle: 'control',
    cursor: 'pointer',
    _focusVisible: {
      layerStyle: 'focusRing',
    },
  },
  variants: {
    kind: {
      normal: {
        _current: {
          borderColor: 'primary.border',
          background: 'primary.surface',
          color: 'text.primary',
        },
      },
      elite: {
        _current: {
          borderColor: 'danger.border',
          background: 'danger.surface',
          color: 'text.primary',
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
  overflow: { base: 'hidden', md: 'visible' },
  touchAction: '[pan-y]',
  // Full-bleed clip: the slide gap doubles as the bleed — the page padding
  // floored at the 12px design rhythm. The clip window reaches (or
  // overshoots) the screen edge, so a mid-swipe card stays visible all the
  // way out; with gap >= padding the resting neighbour starts at the screen
  // edge or beyond — it can never peek by construction. The wide grid
  // keeps its own rhythm.
  '--deck-gap': {
    base: 'max(var(--layout-inline-padding), token(spacing.3))',
    md: 'spacing.3',
    lg: 'spacing.4',
  },
  marginInline: { base: '[calc(-1 * var(--deck-gap))]', md: '0' },
  paddingInline: { base: '[var(--deck-gap)]', md: '0' },
})

const trackStyles = css.raw({
  display: 'grid',
  gap: '[var(--deck-gap)]',
  gridAutoFlow: { base: 'column', md: 'row' },
  gridAutoColumns: '[100%]',
  gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))' },
  alignItems: 'stretch',
})

export function DiveDeck(props: DiveDeckProps): JSX.Element {
  const i18n = useI18n()
  const isWide = createBreakpointQuery('md')
  // One slide at a time below md: gestures live, the inactive slab inert.
  const stacked = () => !isWide()
  // The picked dive survives reloads; onActivate fires only on user
  // selection (chip or settled swipe), so every write reflects a choice.
  const [storedKind, setStoredKind] = createLocalStorage(DIVE_KIND_STORAGE_KEY, diveKindSchema)
  const deck = createSwipeDeck(DIVE_KINDS, stacked, {
    get initial() {
      return storedKind()
    },
    onActivate: setStoredKind,
  })
  // The section's top edge is the switch's resting position (first child),
  // making it the stable anchor for the scroll-linked shrink.
  const [$section, setSection] = createSignal<HTMLElement>()
  createShrinkProgress({ $host: $section, active: stacked })

  return (
    <section aria-label={i18n._(msg`Deep dive mission board`)} class={css(deckStyles)} ref={setSection}>
      <fieldset aria-label={i18n._(msg`Deep Dives`)} class={css(switchStyles)}>
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
              <DiveSlab
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
