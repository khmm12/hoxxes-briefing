import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { token } from 'styled-system/tokens'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type AppLayoutProps = WithStylingProps<{
  children: JSX.Element
}>

const layoutStyles = css.raw({
  position: 'relative',
  zIndex: 'base',
  width: 'full',
  minHeight: '[100svh]',
  color: 'text.secondary',
  // `clip` over `hidden`: same clipping, but no scroll container — a hidden
  // ancestor would re-anchor descendant `position: sticky` to <main>, which
  // never scrolls (page scrolling lives on the window).
  overflow: 'clip',
  display: 'flex',
  alignItems: 'stretch',
  paddingBlockStart: { base: '2', md: '4' },
  paddingBlockEnd: { base: `[calc(env(safe-area-inset-bottom) + ${token('spacing.8')})]`, md: '12' },
  // Published so full-bleed children can counter the page padding without
  // mirroring its breakpoint scale.
  '--layout-inline-padding': { base: 'token(spacing.3)', md: 'token(spacing.4)', lg: 'token(spacing.6)' },
  paddingInline: '[var(--layout-inline-padding)]',
  '& > *': {
    minWidth: '0',
    maxWidth: 'full',
  },
})

export function AppLayout(props: AppLayoutProps): JSX.Element {
  return <main class={resolveClass(props.class, props.css, layoutStyles)}>{props.children}</main>
}
