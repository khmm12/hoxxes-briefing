import { For } from 'solid-js'
import { useParams } from '@solidjs/router'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { AppCapabilitiesProvider } from '~/shared/lib/app-capabilities'
import { scenarios } from './scenarios'

// Dev-only playground: renders every briefing page state from fixtures, no
// network involved. Registered in the app router only when import.meta.env.DEV.

// Bottom-docked so it never occludes the page's own top-pinned chrome
// (the dive switch sticks to the viewport top on mobile).
const switcherStyles = css.raw({
  position: 'fixed',
  insetBlockEnd: '0',
  insetInline: '0',
  zIndex: 'overlay',
  display: 'flex',
  gap: '1',
  paddingBlock: '1',
  paddingInline: '2',
  borderBlockStartWidth: '1px',
  borderBlockStartStyle: 'solid',
  borderBlockStartColor: 'border.strong',
  background: 'surface.raised',
  overflowX: 'auto',
})

const switcherLinkRecipe = cva({
  base: {
    flexShrink: '0',
    paddingBlock: '0.5',
    paddingInline: '2',
    borderRadius: 'md',
    color: 'text.secondary',
    textStyle: 'caption',
    fontWeight: '600',
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
        color: 'primary.hover',
      },
      false: {},
    },
  },
  defaultVariants: {
    active: false,
  },
})

const stageStyles = css.raw({
  // Span the full layout width so the Board's own `marginInline: auto` centers it
  // as it does on the real route, where it is a direct flex child of AppLayout.
  // Without this the wrapper shrinks to the Board's width and pins it left.
  width: 'full',
  paddingBlockEnd: '8',
})

export function PlaygroundPage(): JSX.Element {
  const params = useParams<{ scenario?: string }>()
  const scenario = () => scenarios.find((entry) => entry.id === params.scenario) ?? scenarios[0]

  return (
    <>
      <nav class={css(switcherStyles)} aria-label="Playground scenarios">
        <For each={scenarios}>
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
      {/* Scenarios are fixtures: persisted state must not leak between them. */}
      <div class={css(stageStyles)}>
        <AppCapabilitiesProvider capabilities={{ persistence: false }}>{scenario().render()}</AppCapabilitiesProvider>
      </div>
    </>
  )
}
