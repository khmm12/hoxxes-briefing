import type { JSX } from '@solidjs/web'
import { cva } from 'styled-system/css'
import { token } from 'styled-system/tokens'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type AppLayoutProps = WithStylingProps<{
  children: JSX.Element
  dockVisible?: boolean
}>

const layoutRecipe = cva({
  base: {
    position: 'relative',
    zIndex: 1,
    width: 'full',
    minHeight: '[100svh]',
    color: 'text',
    // `clip` over `hidden`: same clipping, but no scroll container — a hidden
    // ancestor would re-anchor descendant `position: sticky` to <main>, which
    // never scrolls (page scrolling lives on the window).
    overflow: 'clip',
    display: 'flex',
    alignItems: 'stretch',
    paddingBlockStart: { base: 'ui8', md: 'ui16', lg: 'ui24' },
    paddingBlockEnd: { base: `[calc(env(safe-area-inset-bottom) + ${token('spacing.ui36')})]`, md: 'ui32' },
    // Published so full-bleed children can counter the page padding without
    // mirroring its breakpoint scale.
    '--layout-inline-padding': { base: 'token(spacing.ui8)', md: 'token(spacing.ui16)', lg: 'token(spacing.ui24)' },
    paddingInline: '[var(--layout-inline-padding)]',
    '& > *': {
      minWidth: '0',
      maxWidth: 'full',
    },
  },
  variants: {
    dock: {
      hidden: {},
      visible: {
        paddingBlockEnd: { base: `[calc(env(safe-area-inset-bottom) + ${token('spacing.ui80')})]`, md: 'ui48' },
      },
    },
  },
  defaultVariants: {
    dock: 'hidden',
  },
})

export function AppLayout(props: AppLayoutProps): JSX.Element {
  return (
    <main
      class={resolveClass(
        props.class,
        props.css,
        layoutRecipe.raw({
          dock: props.dockVisible === true ? 'visible' : 'hidden',
        }),
      )}
    >
      {props.children}
    </main>
  )
}
