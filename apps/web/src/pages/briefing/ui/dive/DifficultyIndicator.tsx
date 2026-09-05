import { createMemo, For } from 'solid-js'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import { type DifficultyLevel, formatDifficultyAssessment, formatDifficultyLevel } from './difficulty-copy'

type DifficultyIndicatorProps = {
  small: DifficultyLevel
  full: DifficultyLevel
  stage?: number
}

export function DifficultyIndicator(props: DifficultyIndicatorProps): JSX.Element {
  const i18n = useI18n()
  const indicators = createMemo(() => {
    const small = formatDifficultyLevel(i18n, props.small)
    const full = formatDifficultyLevel(i18n, props.full)
    return props.small === props.full
      ? [{ grade: props.small, label: small }]
      : [
          { grade: props.small, label: i18n._(msg`1–2: ${small}`) },
          { grade: props.full, label: i18n._(msg`3–4: ${full}`) },
        ]
  })

  return (
    <span
      class={css({
        display: 'inline-flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        columnGap: '2',
        rowGap: '1',
        minWidth: '0',
      })}
    >
      <span class={css({ srOnly: true })}>
        {formatDifficultyAssessment(i18n, props.small, props.full, props.stage)}
      </span>
      <For each={indicators()} keyed={false}>
        {(indicator) => (
          <span aria-hidden="true" class={indicatorRecipe({ grade: indicator().grade })}>
            <svg
              aria-hidden="true"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              class={css({ flexShrink: '0', fontSize: '[token(sizes.icon.16)]' })}
            >
              <For each={chevrons[indicator().grade]}>
                {(y) => (
                  <path
                    d={`M5 ${y + 4} L12 ${y} L19 ${y + 4}`}
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="square"
                  />
                )}
              </For>
            </svg>
            <span>{indicator().label}</span>
          </span>
        )}
      </For>
    </span>
  )
}

const chevrons: Record<DifficultyLevel, number[]> = {
  Easy: [10],
  Manageable: [7, 12],
  Demanding: [5, 10, 15],
  Brutal: [3, 8, 13, 18],
}

const indicatorRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    maxWidth: 'full',
    minWidth: '0',
    overflowWrap: 'anywhere',
    textStyle: 'caption',
  },
  variants: {
    grade: {
      Easy: { color: 'success' },
      Manageable: { color: 'text.secondary' },
      Demanding: { color: 'warning' },
      Brutal: { color: 'danger' },
    },
  },
})
