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
    gap: '3',
    paddingBlock: '3',
    paddingInline: '4',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.subtle',
    borderRadius: 'md',
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
  textStyle: 'eyebrow',
})

const objectiveStackStyles = css.raw({
  display: 'grid',
  gap: '2',
})

const detailLineStyles = css.raw({
  display: 'grid',
  gap: '1',
})

const detailValueLineStyles = css.raw({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  minWidth: '0',
})

// Kind icons ride the slot scale: 24 next to primary values, 20 next to
// secondary values and hazards — the glyph reads slightly larger than the
// text it labels.
const lineIconRecipe = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: '0',
    width: '[1em]',
    height: '[1em]',
    fontSize: '[token(sizes.icon.20)]',
  },
  variants: {
    tone: {
      primary: {
        color: 'primary',
        fontSize: '[token(sizes.icon.24)]',
      },
      secondary: {
        color: 'info',
      },
      warning: {
        color: 'danger',
      },
      mutator: {
        color: 'primary.hover',
      },
    },
  },
  defaultVariants: {
    tone: 'primary',
  },
})

const labelRecipe = cva({
  base: {
    textStyle: 'label',
  },
  variants: {
    tone: {
      objective: {
        color: 'text.muted',
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

const valueTextRecipe = cva({
  base: {
    color: 'text.primary',
    overflowWrap: 'anywhere',
  },
  variants: {
    emphasis: {
      primary: {
        textStyle: 'metric',
      },
      secondary: {
        textStyle: 'metric.sm',
      },
    },
  },
  defaultVariants: {
    emphasis: 'secondary',
  },
})

const hazardStackStyles = css.raw({
  display: 'grid',
  gap: '2',
  paddingBlockStart: '2',
  borderBlockStartWidth: '1px',
  borderBlockStartStyle: 'solid',
  borderBlockStartColor: 'border.subtle',
})

const hazardRecipe = cva({
  base: {
    display: 'grid',
    gap: '1',
    paddingBlock: '2',
    paddingInline: '3',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: 'md',
  },
  variants: {
    tone: {
      warning: {
        borderColor: 'danger.border',
        background: 'danger.surface',
      },
      mutator: {
        borderColor: 'primary.border',
        background: 'primary.surface',
      },
    },
  },
})

const quietHazardStyles = css.raw({
  color: 'text.secondary',
  textStyle: 'label',
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
      <span class={css(detailValueLineStyles)}>
        <span class={css(lineIconRecipe.raw({ tone: props.iconTone }))} aria-hidden="true">
          {props.icon}
        </span>
        <strong class={css(valueTextRecipe.raw({ emphasis: props.emphasis }))}>{props.value}</strong>
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
      <span class={css(detailValueLineStyles)}>
        <span class={css(lineIconRecipe.raw({ tone: props.tone }))} aria-hidden="true">
          {props.icon}
        </span>
        <strong class={css(valueTextRecipe.raw())}>{props.value}</strong>
      </span>
    </span>
  )
}
