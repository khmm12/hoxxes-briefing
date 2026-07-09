import { For, Show } from 'solid-js'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import type {
  DeepDiveDreadnought,
  DeepDiveMission,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
} from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { Tooltip } from '~/shared/ui/tooltip'
import {
  formatAnomaly,
  formatAnomalyDescription,
  formatDreadnought,
  formatDreadnoughtDescription,
  formatPrimaryObjective,
  formatPrimaryObjectiveDescription,
  formatSecondaryObjective,
  formatSecondaryObjectiveDescription,
  formatWarning,
  formatWarningDescription,
} from './dive-copy'
import { AnomalyKindIcon, PrimaryObjectiveKindIcon, SecondaryObjectiveKindIcon, WarningKindIcon } from './dive-glyphs'

type StageBlockProps = {
  index: number
  kind: 'elite' | 'normal'
  mission: DeepDiveMission
}

const stageBlockRecipe = cva({
  base: {
    display: 'grid',
    gap: '3',
    paddingBlock: { base: '3', md: '4' },
    paddingInline: { base: '3', md: '4' },
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
// secondary values and modifiers — the glyph reads slightly larger than the
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
      anomaly: {
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
      mutator: {
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

const mutatorStackStyles = css.raw({
  display: 'grid',
  gap: '2',
  paddingBlockStart: '2',
  borderBlockStartWidth: '1px',
  borderBlockStartStyle: 'solid',
  borderBlockStartColor: 'border.subtle',
})

const mutatorRecipe = cva({
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
      anomaly: {
        borderColor: 'primary.border',
        background: 'primary.surface',
      },
    },
  },
})

const quietMutatorStyles = css.raw({
  color: 'text.secondary',
  textStyle: 'label',
})

export function StageBlock(props: StageBlockProps): JSX.Element {
  const i18n = useI18n()

  const hasNoMutator = () => props.mission.warning == null && props.mission.anomaly == null

  return (
    <li class={css(stageBlockRecipe.raw({ kind: props.kind }))}>
      <span class={css(stageIndexStyles)}>
        {i18n._(msg`Stage`)} {props.index + 1}
      </span>

      <div class={css(objectiveStackStyles)}>
        <PrimaryObjectiveRow objective={props.mission.primaryObjective} />
        <SecondaryObjectiveRow objective={props.mission.secondaryObjective} />
      </div>

      <div class={css(mutatorStackStyles)}>
        <Show when={props.mission.warning} keyed>
          {(warning) => (
            <Tooltip align="start" label={formatWarningDescription(i18n, warning)}>
              <MutatorLine
                icon={<WarningKindIcon kind={warning} />}
                label={i18n._(msg`Warning`)}
                tone="warning"
                value={formatWarning(i18n, warning)}
              />
            </Tooltip>
          )}
        </Show>

        <Show when={props.mission.anomaly} keyed>
          {(anomaly) => (
            <Tooltip align="start" label={formatAnomalyDescription(i18n, anomaly)}>
              <MutatorLine
                icon={<AnomalyKindIcon kind={anomaly} />}
                label={i18n._(msg`Anomaly`)}
                tone="anomaly"
                value={formatAnomaly(i18n, anomaly)}
              />
            </Tooltip>
          )}
        </Show>

        <Show when={hasNoMutator()}>
          <p class={css(quietMutatorStyles)}>{i18n._(msg`No warning or anomaly on this stage.`)}</p>
        </Show>
      </div>
    </li>
  )
}

function PrimaryObjectiveRow(props: { objective: DeepDivePrimaryObjective }): JSX.Element {
  const i18n = useI18n()

  return (
    <ObjectiveLine
      icon={<PrimaryObjectiveKindIcon kind={props.objective.kind} />}
      label={i18n._(msg`Primary objective`)}
    >
      <ObjectiveValue emphasis="primary" description={formatPrimaryObjectiveDescription(i18n, props.objective.kind)}>
        <Show
          when={props.objective.kind === 'Elimination' && props.objective}
          fallback={formatPrimaryObjective(i18n, props.objective)}
        >
          {(objective) => <EliminationObjectiveValue dreadnoughts={objective().dreadnoughts} />}
        </Show>
      </ObjectiveValue>
    </ObjectiveLine>
  )
}

function SecondaryObjectiveRow(props: { objective: DeepDiveSecondaryObjective }): JSX.Element {
  const i18n = useI18n()

  return (
    <ObjectiveLine
      icon={<SecondaryObjectiveKindIcon kind={props.objective.kind} />}
      iconTone="secondary"
      label={i18n._(msg`Secondary objective`)}
    >
      <ObjectiveValue
        emphasis="secondary"
        description={formatSecondaryObjectiveDescription(i18n, props.objective.kind)}
      >
        <Show
          when={props.objective.kind === 'Elimination' && props.objective}
          fallback={<>{formatSecondaryObjective(i18n, props.objective)}</>}
        >
          {(objective) => <EliminationObjectiveValue dreadnoughts={objective().dreadnoughts} />}
        </Show>
      </ObjectiveValue>
    </ObjectiveLine>
  )
}

// The value renderer owns the description tooltip: a described objective wraps
// its value in a Tooltip, one without a description (Elimination) renders bare.
// The <strong> is built once and reused across both branches, so an Elimination
// value's per-dreadnought tooltips never nest under a line-level trigger.
function ObjectiveValue(props: {
  emphasis: 'primary' | 'secondary'
  description?: string
  children: JSX.Element
}): JSX.Element {
  const value = <strong class={css(valueTextRecipe.raw({ emphasis: props.emphasis }))}>{props.children}</strong>

  return (
    <Show when={props.description} fallback={value}>
      {(description) => (
        <Tooltip align="start" label={description()}>
          {value}
        </Tooltip>
      )}
    </Show>
  )
}

// The dreadnought list is the only tokenized objective value: each named variant
// gets its own tooltip, so the shell text and separators are rendered here
// rather than folded into a flat string.
function EliminationObjectiveValue(props: { dreadnoughts: readonly DeepDiveDreadnought[] }): JSX.Element {
  const i18n = useI18n()

  return (
    <>
      {i18n._(msg`Dreadnought x${props.dreadnoughts.length}`)}
      {' ('}
      <For each={props.dreadnoughts} keyed={false}>
        {(dreadnought, index) => (
          <>
            <Show when={index > 0}>{' + '}</Show>
            <Tooltip align="start" label={formatDreadnoughtDescription(i18n, dreadnought())}>
              <span>{formatDreadnought(i18n, dreadnought())}</span>
            </Tooltip>
          </>
        )}
      </For>
      {')'}
    </>
  )
}

function ObjectiveLine(props: {
  icon: JSX.Element
  iconTone?: 'primary' | 'secondary'
  label: string
  children: JSX.Element
}): JSX.Element {
  return (
    <div class={css(detailLineStyles)}>
      <span class={css(labelRecipe.raw({ tone: 'objective' }))}>{props.label}</span>
      <span class={css(detailValueLineStyles)}>
        <span class={css(lineIconRecipe.raw({ tone: props.iconTone }))} aria-hidden="true">
          {props.icon}
        </span>
        {props.children}
      </span>
    </div>
  )
}

function MutatorLine(props: {
  icon: JSX.Element
  label: string
  tone: 'anomaly' | 'warning'
  value: string
}): JSX.Element {
  return (
    <div class={css(mutatorRecipe.raw({ tone: props.tone }))}>
      <span class={css(labelRecipe.raw({ tone: 'mutator' }))}>{props.label}</span>
      <span class={css(detailValueLineStyles)}>
        <span class={css(lineIconRecipe.raw({ tone: props.tone }))} aria-hidden="true">
          {props.icon}
        </span>
        <strong class={css(valueTextRecipe.raw())}>{props.value}</strong>
      </span>
    </div>
  )
}
