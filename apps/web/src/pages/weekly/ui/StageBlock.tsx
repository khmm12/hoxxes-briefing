import { createMemo, Show } from 'solid-js'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import type { WeeklySnapshotResult } from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { Tooltip } from '~/shared/ui/tooltip'
import {
  formatMutator,
  formatMutatorDescription,
  formatPrimaryObjective,
  formatSecondaryObjective,
  formatWarning,
  formatWarningDescription,
} from './weekly-dive-copy'
import {
  MutatorKindIcon,
  PrimaryObjectiveKindIcon,
  SecondaryObjectiveKindIcon,
  WarningKindIcon,
} from './weekly-dive-glyphs'

type WeeklyDive = WeeklySnapshotResult['dives']['normal']
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
  gap: 'ui4',
})

const detailValueLineRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: 'ui8',
    minWidth: '0',
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

// Kind icons render at 1.25em so the glyph reads slightly larger than the
// text it labels, in every text size context.
const lineIconRecipe = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: '0',
    width: '[1em]',
    height: '[1em]',
    fontSize: '1.25em',
  },
  variants: {
    tone: {
      primary: {
        color: 'brand',
      },
      secondary: {
        color: 'info',
      },
      warning: {
        color: 'danger',
      },
      mutator: {
        color: 'brand.hover',
      },
    },
  },
  defaultVariants: {
    tone: 'primary',
  },
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

const valueTextStyles = css.raw({
  color: 'text.primary',
  fontWeight: '600',
  lineHeight: '1.55',
  overflowWrap: 'anywhere',
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
    gap: 'ui4',
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
          icon={<PrimaryObjectiveKindIcon kind={props.mission.primaryObjective.kind} />}
          label={i18n._(msg`Primary objective`)}
          value={formatPrimaryObjective(i18n, props.mission.primaryObjective)}
        />
        <ObjectiveLine
          emphasis="secondary"
          icon={<SecondaryObjectiveKindIcon kind={props.mission.secondaryObjective.kind} />}
          iconTone="secondary"
          label={i18n._(msg`Secondary objective`)}
          value={formatSecondaryObjective(i18n, props.mission.secondaryObjective)}
        />
      </div>

      <div class={css(hazardStackStyles)}>
        <Show when={props.mission.warning} keyed>
          {(warning) => (
            <Tooltip align="start" label={formatWarningDescription(i18n, warning)}>
              <HazardLine
                icon={<WarningKindIcon kind={warning} />}
                label={i18n._(msg`Warning`)}
                tone="warning"
                value={formatWarning(i18n, warning)}
              />
            </Tooltip>
          )}
        </Show>

        <Show when={props.mission.mutator} keyed>
          {(mutator) => (
            <Tooltip align="start" label={formatMutatorDescription(i18n, mutator)}>
              <HazardLine
                icon={<MutatorKindIcon kind={mutator} />}
                label={i18n._(msg`Mutator`)}
                tone="mutator"
                value={formatMutator(i18n, mutator)}
              />
            </Tooltip>
          )}
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
      <span class={css(labelRecipe.raw({ tone: 'objective' }))}>{props.label}</span>
      <span class={css(detailValueLineRecipe.raw({ emphasis: props.emphasis }))}>
        <span class={css(lineIconRecipe.raw({ tone: props.iconTone }))} aria-hidden="true">
          {props.icon}
        </span>
        <strong class={css(valueTextStyles)}>{props.value}</strong>
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
  // The root is a <span> because Tooltip wraps hazard lines in its inline
  // trigger; a <div> inside that span would be invalid HTML.
  return (
    <span class={css(hazardRecipe.raw({ tone: props.tone }))}>
      <span class={css(labelRecipe.raw({ tone: 'hazard' }))}>{props.label}</span>
      <span class={css(detailValueLineRecipe.raw())}>
        <span class={css(lineIconRecipe.raw({ tone: props.tone }))} aria-hidden="true">
          {props.icon}
        </span>
        <strong class={css(valueTextStyles)}>{props.value}</strong>
      </span>
    </span>
  )
}
