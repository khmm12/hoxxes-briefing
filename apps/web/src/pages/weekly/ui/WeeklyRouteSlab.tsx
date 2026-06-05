import type { Accessor } from 'solid-js'
import { createMemo, createSignal, createUniqueId, For, Show } from 'solid-js'
import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { token } from 'styled-system/tokens'
import type { WeeklySnapshotResult } from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { createBreakpointQuery } from '~/shared/lib/create-media-query'
import { Eyebrow } from '~/shared/ui/eyebrow'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'
import { Tooltip } from '~/shared/ui/tooltip'
import { buildWeeklyRouteIntel } from '../model/weekly-route-intel'
import { buildQuickReadChips, type QuickReadChip } from '../model/weekly-route-quick-read'
import { StageBlock } from './StageBlock'
import {
  formatBiome,
  formatDiveKind,
  formatMutator,
  formatMutatorDescription,
  formatWarning,
  formatWarningDescription,
} from './weekly-dive-copy'
import { BiomeKindIcon, MutatorKindIcon, WarningKindIcon } from './weekly-dive-glyphs'
import { formatWeeklyRouteIntelNote } from './weekly-route-intel-copy'
import { getVisibleQuickReadChips } from './weekly-route-quick-read-view'

type WeeklyDive = WeeklySnapshotResult['dives']['normal']

type WeeklyRouteSlabProps = WithStylingProps<{
  dive: WeeklyDive
  expired: boolean
  kind: 'elite' | 'normal'
  inert?: boolean
}>

const slabRecipe = cva({
  base: {
    '--route-accent-surface': token('colors.brand.surface'),
    position: 'relative',
    isolation: 'isolate',
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    gap: { base: 'ui12', md: 'ui16' },
    height: 'full',
    paddingBlock: { base: 'ui16', md: 'ui24' },
    paddingInline: { base: 'ui16', md: 'ui24' },
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'brand.border',
    borderRadius: 'ui12',
    background: 'surface.raised',
    boxShadow: 'elevation.medium',
    overflow: 'hidden',
    _before: {
      content: '""',
      position: 'absolute',
      inset: '0',
      background: '[radial-gradient(circle at top right, var(--route-accent-surface) 0, transparent 65%)]',
      pointerEvents: 'none',
    },
    '& > *': {
      position: 'relative',
      zIndex: 1,
    },
  },
  variants: {
    kind: {
      normal: {},
      elite: {
        '--route-accent-surface': token('colors.danger.surface'),
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
  gap: 'ui8',
})

const introStyles = css.raw({
  display: 'grid',
  gap: { base: 'ui2', md: 'ui4' },
})

const titleStyles = css.raw({
  color: 'text.primary',
  textStyle: 'display.title',
})

const biomeIconStyles = css.raw({
  fontSize: '1.25em',
})

const biomeStyles = css.raw({
  display: 'flex',
  alignItems: 'center',
  gap: 'ui4',
  color: 'text.disabled',
  fontSize: '0.875rem',
  fontWeight: '500',
  letterSpacing: '0.02em',
  lineHeight: '1.55',
})

const freshnessStyles = css.raw({
  color: 'danger',
  fontSize: '0.875rem',
  fontWeight: '600',
  letterSpacing: '0.02em',
  lineHeight: '1.55',
})

const noteStyles = css.raw({
  color: 'text.secondary',
  display: { base: '-webkit-box', md: 'block' },
  fontSize: '0.875rem',
  lineHeight: '1.55',
  overflow: 'hidden',
  lineClamp: { base: 2, md: 'none' },
})

const metaStyles = css.raw({
  display: 'grid',
  gap: 'ui8',
})

const metaLabelStyles = css.raw({
  color: 'text.disabled',
  fontSize: '0.875rem',
  fontWeight: '500',
  letterSpacing: '0.02em',
  lineHeight: '1.55',
})

const chipsStyles = css.raw({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'ui8',
})

const chipRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'ui4',
    minHeight: 'ui24',
    paddingBlock: 'ui4',
    paddingInline: 'ui8',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.subtle',
    borderRadius: 'full',
    background: 'transparent',
    color: 'text.secondary',
    fontSize: '0.875rem',
    fontWeight: '500',
    letterSpacing: '0.02em',
    lineHeight: '1.55',
  },
  variants: {
    kind: {
      quiet: {},
      warning: {
        borderColor: 'danger.border',
      },
      mutator: {
        borderColor: 'brand.border',
      },
      overflow: {
        borderColor: 'border.strong',
        color: 'brand.hover',
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
  gap: 'ui12',
  listStyle: 'none',
  padding: '0',
})

export function WeeklyRouteSlab(props: WeeklyRouteSlabProps): JSX.Element {
  const i18n = useI18n()
  const [expanded, setExpanded] = createSignal(false)
  const visibleLimit = createQuickReadVisibleLimit()

  const intel = createMemo(() => buildWeeklyRouteIntel(props.dive, props.kind))
  const chips = createMemo(() => buildQuickReadChips(props.dive))
  const visibleChips = createMemo(() => getVisibleQuickReadChips(chips(), visibleLimit(), expanded()))

  const routeScanId = createUniqueId()

  return (
    <article class={resolveClass(props.class, props.css, slabRecipe.raw({ kind: props.kind }))} inert={props.inert}>
      <header class={css(headerStyles)}>
        <div class={css(introStyles)}>
          <Eyebrow css={{ srOnly: { base: true, lg: false } }} tone={props.kind === 'elite' ? 'danger' : 'brand'}>
            {formatDiveKind(i18n, props.kind)}
          </Eyebrow>
          <h2 class={css(titleStyles)}>{props.dive.name}</h2>
          <p class={css(biomeStyles)}>
            <BiomeKindIcon css={biomeIconStyles} kind={props.dive.biome} />
            {formatBiome(i18n, props.dive.biome)}
          </p>
          {props.expired ? <p class={css(freshnessStyles)}>{i18n._(msg`Last known board`)}</p> : null}
        </div>
        <p class={css(noteStyles)}>{formatWeeklyRouteIntelNote(i18n, intel().note)}</p>
      </header>

      <Show when={chips().length > 0}>
        <section class={css(metaStyles)} aria-label={i18n._(msg`Route scan`)}>
          <p class={css(metaLabelStyles)}>{i18n._(msg`Route scan`)}</p>
          <div class={css(chipsStyles)} id={routeScanId}>
            <For each={visibleChips().visible} keyed={false}>
              {(chip) => <QuickReadChipView chip={chip()} />}
            </For>
            <Show when={visibleChips().overflowCount > 0}>
              <button
                aria-controls={routeScanId}
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
  fontSize: '1.25em',
})

const chipMutatorIconStyles = css.raw({
  color: 'brand.hover',
  fontSize: '1.25em',
})

const chipTooltipStyles = css.raw({
  display: 'inline-block',
  borderRadius: 'full',
})

function QuickReadChipView(props: { chip: QuickReadChip }): JSX.Element {
  const i18n = useI18n()

  return (
    <Tooltip align="center" css={chipTooltipStyles} label={formatQuickReadChipDescription(i18n, props.chip)}>
      <span class={css(chipRecipe.raw({ kind: props.chip.kind }))}>
        {props.chip.kind === 'warning' ? (
          <WarningKindIcon css={chipWarningIconStyles} kind={props.chip.value} />
        ) : (
          <MutatorKindIcon css={chipMutatorIconStyles} kind={props.chip.value} />
        )}
        {formatQuickReadChip(i18n, props.chip)}
      </span>
    </Tooltip>
  )
}

function formatQuickReadChipDescription(i18n: I18n, chip: QuickReadChip): string {
  return chip.kind === 'warning'
    ? formatWarningDescription(i18n, chip.value)
    : formatMutatorDescription(i18n, chip.value)
}

function formatQuickReadChip(i18n: I18n, chip: QuickReadChip): string {
  if (chip.kind === 'warning') {
    return formatWarning(i18n, chip.value)
  }

  if (chip.kind === 'mutator') {
    return formatMutator(i18n, chip.value)
  }

  return i18n._(msg`All clear`)
}

function formatOverflowChip(i18n: I18n, overflowCount: number): string {
  return i18n._(msg`+${overflowCount} more`)
}

function createQuickReadVisibleLimit(): Accessor<number> {
  const isWide = createBreakpointQuery('md')
  return () => (isWide() ? 3 : 2)
}
