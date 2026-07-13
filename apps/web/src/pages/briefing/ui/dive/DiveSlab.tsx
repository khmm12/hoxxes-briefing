import type { Accessor } from 'solid-js'
import { createMemo, createSignal, createUniqueId, For, Show } from 'solid-js'
import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { token } from 'styled-system/tokens'
import type { DeepDive } from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { createBreakpointQuery } from '~/shared/lib/create-media-query'
import { Eyebrow } from '~/shared/ui/eyebrow'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'
import { Tooltip } from '~/shared/ui/tooltip'
import type { Mutator } from '../../model/catalog'
import { buildDiveRundown } from '../../model/dive-rundown'
import { buildIntel } from '../../model/intel'
import {
  formatBiome,
  formatBiomeDescription,
  formatDiveKind,
  formatMutator,
  formatMutatorDescription,
} from './dive-copy'
import { AnomalyKindIcon, BiomeKindIcon, WarningKindIcon } from './dive-glyphs'
import { getVisibleRundownChips } from './dive-rundown-view'
import { formatIntelNote } from './intel-copy'
import { StageBlock } from './StageBlock'

type DiveSlabProps = WithStylingProps<{
  dive: DeepDive
  expired: boolean
  kind: 'elite' | 'normal'
  inert?: boolean
}>

const slabRecipe = cva({
  base: {
    '--dive-accent-surface': token('colors.primary.surface'),
    position: 'relative',
    isolation: 'isolate',
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    gap: '4',
    height: 'full',
    paddingBlock: { base: '4', md: '5', lg: '6' },
    paddingInline: { base: '4', md: '5', lg: '6' },
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'primary.border',
    borderRadius: 'lg',
    background: 'surface.raised',
    boxShadow: 'elevation.medium',
    overflow: 'hidden',
    _before: {
      content: '""',
      position: 'absolute',
      inset: '0',
      background: '[radial-gradient(circle at top right, var(--dive-accent-surface) 0, transparent 65%)]',
      pointerEvents: 'none',
    },
    '& > *': {
      position: 'relative',
      zIndex: 'raised',
    },
  },
  variants: {
    kind: {
      normal: {},
      elite: {
        '--dive-accent-surface': token('colors.danger.surface'),
        borderColor: 'danger.border',
        background: 'surface.sunken',
      },
    },
  },
  defaultVariants: {
    kind: 'normal',
  },
})

const headerStyles = css.raw({
  display: 'grid',
  gap: '1',
})

const introStyles = css.raw({
  display: 'grid',
  gap: '1',
})

const titleStyles = css.raw({
  color: 'text.primary',
  // display.xl on every viewport: the dive name is seed-generated flavor,
  // it does not earn the page's largest type on desktop.
  textStyle: 'display.xl',
})

const biomeIconStyles = css.raw({
  fontSize: '[token(sizes.icon.16)]',
})

const biomeStyles = css.raw({
  // Shrink to the label so the tooltip trigger (hover + focus ring) hugs the
  // text, not the full width of the header grid column the <p> would otherwise
  // stretch to fill.
  justifySelf: 'start',
  display: 'flex',
  alignItems: 'center',
  gap: '1.5',
  color: 'text.muted',
  textStyle: 'label',
})

const freshnessStyles = css.raw({
  color: 'danger',
  textStyle: 'label.strong',
})

const noteStyles = css.raw({
  color: 'text.secondary',
  textStyle: 'body.sm',
})

const metaStyles = css.raw({
  display: 'grid',
  gap: '2',
})

const metaLabelStyles = css.raw({
  color: 'text.muted',
  textStyle: 'label',
})

const chipsStyles = css.raw({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
})

const chipRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    minHeight: '7',
    paddingBlock: '1',
    paddingInline: '2.5',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.subtle',
    borderRadius: 'full',
    background: 'transparent',
    color: 'text.secondary',
    textStyle: 'label',
  },
  variants: {
    kind: {
      quiet: {},
      warning: {
        borderColor: 'danger.border',
      },
      anomaly: {
        borderColor: 'primary.border',
      },
      overflow: {
        borderColor: 'border.strong',
        color: 'primary.hover',
        fontWeight: '600',
        cursor: 'pointer',
        _hover: {
          background: 'surface',
        },
        _focusVisible: {
          layerStyle: 'focusRing',
        },
      },
    },
  },
  defaultVariants: {
    kind: 'quiet',
  },
})

const stageListStyles = css.raw({
  display: 'grid',
  alignContent: 'start',
  gap: '3',
  listStyle: 'none',
  padding: '0',
})

export function DiveSlab(props: DiveSlabProps): JSX.Element {
  const i18n = useI18n()
  const [expanded, setExpanded] = createSignal(false)
  const visibleLimit = createRundownVisibleLimit()

  const intel = createMemo(() => buildIntel(props.dive, props.kind))
  const chips = createMemo(() => buildDiveRundown(props.dive))
  const visibleChips = createMemo(() => getVisibleRundownChips(chips(), visibleLimit(), expanded()))

  const rundownId = createUniqueId()

  return (
    <article class={resolveClass(props.class, props.css, slabRecipe.raw({ kind: props.kind }))} inert={props.inert}>
      <header class={css(headerStyles)}>
        <div class={css(introStyles)}>
          <Eyebrow css={{ srOnly: { base: true, md: false } }} tone={props.kind === 'elite' ? 'danger' : 'primary'}>
            {formatDiveKind(i18n, props.kind)}
          </Eyebrow>
          <h2 class={css(titleStyles)}>{props.dive.name}</h2>
          <Tooltip align="start" label={formatBiomeDescription(i18n, props.dive.biome)}>
            <p class={css(biomeStyles)}>
              <BiomeKindIcon css={biomeIconStyles} kind={props.dive.biome} />
              {formatBiome(i18n, props.dive.biome)}
            </p>
          </Tooltip>
          {props.expired ? <p class={css(freshnessStyles)}>{i18n._(msg`Last known briefing`)}</p> : null}
        </div>
        <p class={css(noteStyles)}>{formatIntelNote(i18n, intel())}</p>
      </header>

      <Show when={chips().length > 0}>
        <section class={css(metaStyles)} aria-label={i18n._(msg`Rundown`)}>
          <p class={css(metaLabelStyles)}>{i18n._(msg`Rundown`)}</p>
          <div class={css(chipsStyles)} id={rundownId}>
            <For each={visibleChips().visible} keyed={false}>
              {(chip) => <RundownChipView chip={chip()} />}
            </For>
            <Show when={visibleChips().overflowCount > 0}>
              <button
                aria-controls={rundownId}
                aria-expanded={expanded() ? 'true' : 'false'}
                class={css(chipRecipe.raw({ kind: 'overflow' }))}
                type="button"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded() ? i18n._(msg`Show less`) : formatOverflowChip(i18n, visibleChips().overflowCount)}
              </button>
            </Show>
          </div>
        </section>
      </Show>

      <ol class={css(stageListStyles)}>
        <For each={props.dive.missions} keyed={false}>
          {(mission, index) => <StageBlock index={index} kind={props.kind} mission={mission()} />}
        </For>
      </ol>
    </article>
  )
}

const chipWarningIconStyles = css.raw({
  color: 'danger',
  fontSize: '[token(sizes.icon.16)]',
})

const chipAnomalyIconStyles = css.raw({
  color: 'primary.hover',
  fontSize: '[token(sizes.icon.16)]',
})

function RundownChipView(props: { chip: Mutator }): JSX.Element {
  const i18n = useI18n()

  return (
    <Tooltip align="center" label={formatMutatorDescription(i18n, props.chip)}>
      <span class={css(chipRecipe.raw({ kind: props.chip.kind }))}>
        {props.chip.kind === 'warning' ? (
          <WarningKindIcon css={chipWarningIconStyles} kind={props.chip.value} />
        ) : (
          <AnomalyKindIcon css={chipAnomalyIconStyles} kind={props.chip.value} />
        )}
        {formatMutator(i18n, props.chip)}
      </span>
    </Tooltip>
  )
}

function formatOverflowChip(i18n: I18n, overflowCount: number): string {
  return i18n._(msg`+${overflowCount} more`)
}

function createRundownVisibleLimit(): Accessor<number> {
  const isWide = createBreakpointQuery('md')
  return () => (isWide() ? 3 : 2)
}
