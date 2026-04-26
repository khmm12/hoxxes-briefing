import type { ApiV1WeeklyResponse } from '@hoxxes-briefing/contracts/api/v1'
import { msg } from '@lingui/core/macro'
import { createMemo, type JSX, Show } from 'solid-js'
import { css, cva } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import { MutatorGlyphIcon, PrimaryObjectiveIcon, SecondaryObjectiveIcon, WarningGlyphIcon } from '~/shared/ui/icon'
import {
  formatMutator,
  formatPrimaryObjective,
  formatSecondaryObjective,
  formatWarning,
} from '../lib/weekly-dive-labels'

type WeeklyDive = ApiV1WeeklyResponse['dives']['normal']
type WeeklyMission = WeeklyDive['missions'][number]

type StageBlockProps = {
  index: number
  kind: 'elite' | 'normal'
  mission: WeeklyMission
}

const stageBlockRecipe = cva({
  base: {
    display: 'grid',
    gap: { base: 'ui8', md: 'ui12' },
    paddingBlock: 'ui12',
    paddingInline: { base: 'ui12', md: 'ui16' },
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.subtle',
    borderRadius: 'ui8',
    background: 'surface.sunken',
  },
  variants: {
    kind: {
      normal: {},
      elite: {
        borderColor: 'danger.border',
      },
    },
  },
  defaultVariants: {
    kind: 'normal',
  },
})

const stageIndexStyles = css.raw({
  color: 'text.primary',
  fontFamily: 'display',
  fontSize: '0.875rem',
  fontWeight: '700',
  letterSpacing: '0.04em',
  lineHeight: '1.333',
  textTransform: 'uppercase',
})

const objectiveStackStyles = css.raw({
  display: 'grid',
  gap: 'ui8',
})

const detailLineStyles = css.raw({
  display: 'grid',
  gridTemplateColumns: 'var(--sizes-icon-md) minmax(0, 1fr)',
  gap: 'ui12',
  alignItems: 'start',
})

const detailIconRecipe = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '1em',
    height: '1em',
    marginBlockStart: 'ui2',
    color: 'brand',
    fontSize: 'token(sizes.icon.md)',
  },
  variants: {
    tone: {
      primary: {},
      secondary: {
        color: 'info',
      },
    },
  },
  defaultVariants: {
    tone: 'primary',
  },
})

const detailCopyStyles = css.raw({
  display: 'grid',
  gap: 'ui4',
  minWidth: 0,
})

const labelRecipe = cva({
  base: {
    fontSize: '0.875rem',
    fontWeight: '500',
    letterSpacing: '0.02em',
    lineHeight: '1.55',
  },
  variants: {
    tone: {
      objective: {
        color: 'text.disabled',
      },
      hazard: {
        color: 'text.secondary',
      },
    },
  },
  defaultVariants: {
    tone: 'objective',
  },
})

const objectiveValueRecipe = cva({
  base: {
    color: 'text.primary',
    fontWeight: '600',
    lineHeight: '1.55',
    overflowWrap: 'anywhere',
  },
  variants: {
    emphasis: {
      primary: {
        fontSize: '1.25rem',
      },
      secondary: {
        fontSize: '1rem',
      },
    },
  },
  defaultVariants: {
    emphasis: 'secondary',
  },
})

const hazardStackStyles = css.raw({
  display: 'grid',
  gap: 'ui8',
  paddingBlockStart: 'ui8',
  borderBlockStartWidth: '1px',
  borderBlockStartStyle: 'solid',
  borderBlockStartColor: 'border.subtle',
})

const hazardRecipe = cva({
  base: {
    display: 'grid',
    gridTemplateColumns: 'var(--sizes-icon-md) minmax(0, 1fr)',
    gap: 'ui8',
    alignItems: 'start',
    paddingBlock: 'ui8',
    paddingInline: 'ui12',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: 'ui8',
    background: 'surface',
  },
  variants: {
    tone: {
      warning: {
        borderColor: 'danger.border',
        background: 'danger.surface',
      },
      mutator: {
        borderColor: 'brand.border',
        background: 'brand.surface',
      },
    },
  },
})

const hazardIconRecipe = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '1em',
    height: '1em',
    color: 'danger',
    fontSize: 'token(sizes.icon.md)',
  },
  variants: {
    tone: {
      warning: {},
      mutator: {
        color: 'brand.hover',
      },
    },
  },
})

const hazardValueStyles = css.raw({
  color: 'text.primary',
  fontSize: '1rem',
  fontWeight: '600',
  lineHeight: '1.55',
  overflowWrap: 'anywhere',
})

const quietHazardStyles = css.raw({
  color: 'text.secondary',
  fontSize: '0.875rem',
  fontWeight: '500',
  lineHeight: '1.55',
})

export function StageBlock(props: StageBlockProps): JSX.Element {
  const i18n = useI18n()

  const hasWarning = createMemo(() => props.mission.warning != null)
  const hasMutator = createMemo(() => props.mission.mutator != null)

  return (
    <li class={css(stageBlockRecipe.raw({ kind: props.kind }))}>
      <span class={css(stageIndexStyles)}>
        {i18n._(msg`Stage`)} {props.index + 1}
      </span>

      <div class={css(objectiveStackStyles)}>
        <ObjectiveLine
          emphasis="primary"
          icon={<PrimaryObjectiveIcon />}
          label={i18n._(msg`Primary objective`)}
          value={formatPrimaryObjective(i18n, props.mission.primaryObjective)}
        />
        <ObjectiveLine
          emphasis="secondary"
          icon={<SecondaryObjectiveIcon />}
          iconTone="secondary"
          label={i18n._(msg`Secondary objective`)}
          value={formatSecondaryObjective(i18n, props.mission.secondaryObjective)}
        />
      </div>

      <div class={css(hazardStackStyles)}>
        <Show when={hasWarning()}>
          <HazardLine
            icon={<WarningGlyphIcon />}
            label={i18n._(msg`Warning`)}
            tone="warning"
            value={formatWarning(i18n, props.mission.warning)}
          />
        </Show>

        <Show when={hasMutator()}>
          <HazardLine
            icon={<MutatorGlyphIcon />}
            label={i18n._(msg`Mutator`)}
            tone="mutator"
            value={formatMutator(i18n, props.mission.mutator)}
          />
        </Show>

        <Show when={!hasWarning() && !hasMutator()}>
          <p class={css(quietHazardStyles)}>{i18n._(msg`No warning or mutator on this stage.`)}</p>
        </Show>
      </div>
    </li>
  )
}

function ObjectiveLine(props: {
  emphasis: 'primary' | 'secondary'
  icon: JSX.Element
  iconTone?: 'primary' | 'secondary'
  label: string
  value: string
}): JSX.Element {
  return (
    <div class={css(detailLineStyles)}>
      <span class={css(detailIconRecipe.raw({ tone: props.iconTone }))} aria-hidden="true">
        {props.icon}
      </span>
      <span class={css(detailCopyStyles)}>
        <span class={css(labelRecipe.raw({ tone: 'objective' }))}>{props.label}</span>
        <strong class={css(objectiveValueRecipe.raw({ emphasis: props.emphasis }))}>{props.value}</strong>
      </span>
    </div>
  )
}

function HazardLine(props: {
  icon: JSX.Element
  label: string
  tone: 'mutator' | 'warning'
  value: string
}): JSX.Element {
  return (
    <div class={css(hazardRecipe.raw({ tone: props.tone }))}>
      <span class={css(hazardIconRecipe.raw({ tone: props.tone }))} aria-hidden="true">
        {props.icon}
      </span>
      <span class={css(detailCopyStyles)}>
        <span class={css(labelRecipe.raw({ tone: 'hazard' }))}>{props.label}</span>
        <strong class={css(hazardValueStyles)}>{props.value}</strong>
      </span>
    </div>
  )
}
