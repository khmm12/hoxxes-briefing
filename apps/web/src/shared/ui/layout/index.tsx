import type { JSX } from 'solid-js'
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
    width: '100%',
    minHeight: '100svh',
    color: 'text',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
    paddingBlockStart: { base: 'ui8', md: 'ui16', lg: 'ui24' },
    paddingBlockEnd: { base: `calc(env(safe-area-inset-bottom) + ${token('spacing.ui36')})`, md: 'ui32' },
    paddingInline: { base: 'ui8', md: 'ui16', lg: 'ui24' },
    '& > *': {
      minWidth: 0,
      maxWidth: '100%',
    },
  },
  variants: {
    dock: {
      hidden: {},
      visible: {
        paddingBlockEnd: { base: `calc(env(safe-area-inset-bottom) + ${token('spacing.ui80')})`, md: 'ui48' },
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
