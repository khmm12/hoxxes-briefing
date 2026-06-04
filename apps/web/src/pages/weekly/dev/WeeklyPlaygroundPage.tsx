import { For } from 'solid-js'
import { useParams } from '@solidjs/router'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { weeklyScenarios } from './weekly-scenarios'

// Dev-only playground: renders every weekly page state from fixtures, no
// network involved. Registered in the app router only when import.meta.env.DEV.

const switcherStyles = css.raw({
  position: 'fixed',
  insetBlockStart: '0',
  insetInline: '0',
  zIndex: 48,
  display: 'flex',
  gap: 'ui4',
  paddingBlock: 'ui4',
  paddingInline: 'ui8',
  borderBlockEndWidth: '1px',
  borderBlockEndStyle: 'solid',
  borderBlockEndColor: 'border.strong',
  background: 'surface.raised',
  overflowX: 'auto',
})

const switcherLinkRecipe = cva({
  base: {
    flexShrink: '0',
    paddingBlock: 'ui2',
    paddingInline: 'ui8',
    borderRadius: 'ui8',
    color: 'text.secondary',
    fontSize: '0.75rem',
    fontWeight: '600',
    lineHeight: '1.55',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    _hover: {
      background: 'surface.sunken',
    },
  },
  variants: {
    active: {
      true: {
        background: 'surface.sunken',
        color: 'brand.hover',
      },
      false: {},
    },
  },
  defaultVariants: {
    active: false,
  },
})

const stageStyles = css.raw({
  paddingBlockStart: 'ui32',
})

export function WeeklyPlaygroundPage(): JSX.Element {
  const params = useParams<{ scenario?: string }>()
  const scenario = () => weeklyScenarios.find((entry) => entry.id === params.scenario) ?? weeklyScenarios[0]

  return (
    <>
      <nav class={css(switcherStyles)} aria-label="Playground scenarios">
        <For each={weeklyScenarios}>
          {(entry) => (
            // Plain <a> over the router's <A>: its 2.0-beta typings lack
            // children, and a full reload is fine for a dev tool.
            <a
              class={css(switcherLinkRecipe.raw({ active: entry.id === scenario().id }))}
              href={`/__playground/${entry.id}`}
            >
              {entry.title}
            </a>
          )}
        </For>
      </nav>
      <div class={css(stageStyles)}>{scenario().render()}</div>
    </>
  )
}
