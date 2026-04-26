import type { JSX } from 'solid-js'
import { cva } from 'styled-system/css'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type AppLayoutProps = WithStylingProps<{
  children: JSX.Element
  dockVisible?: boolean
  variant?: 'board' | 'state'
}>

const pageNoiseImage =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='rgba(255,255,255,0.12)'%3E%3Ccircle cx='32' cy='28' r='1'/%3E%3Ccircle cx='112' cy='36' r='1'/%3E%3Ccircle cx='136' cy='104' r='1'/%3E%3Ccircle cx='46' cy='120' r='1'/%3E%3Ccircle cx='90' cy='78' r='1'/%3E%3C/g%3E%3C/svg%3E\")"

const layoutRecipe = cva({
  base: {
    position: 'relative',
    zIndex: 1,
    minHeight: '100svh',
    color: 'text',
    overflow: 'hidden',
    _before: {
      content: '""',
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage: 'var(--drg-page-noise)',
      opacity: 0.018,
    },
  },
  variants: {
    dock: {
      hidden: {},
      visible: {
        paddingBlockEnd: { base: 'calc(env(safe-area-inset-bottom) + var(--spacing-ui80))', md: 'ui48', lg: '8rem' },
      },
    },
    variant: {
      board: {
        width: {
          base: 'min(100% - var(--spacing-ui16), 32rem)',
          md: 'min(100% - var(--spacing-ui16), var(--sizes-content-board))',
          lg: 'min(100% - var(--spacing-ui32), var(--sizes-content-board))',
        },
        marginInline: 'auto',
        paddingBlockStart: { base: 'ui8', md: 'ui16', lg: 'ui24' },
        paddingBlockEnd: { base: 'calc(env(safe-area-inset-bottom) + var(--spacing-ui80))', md: 'ui48' },
      },
      state: {
        width: 'min(100% - var(--spacing-ui16), 36rem)',
        minHeight: '100svh',
        marginInline: 'auto',
        display: 'grid',
        placeItems: 'center',
        padding: 0,
      },
    },
  },
  defaultVariants: {
    dock: 'hidden',
    variant: 'board',
  },
})

const layoutStyle = {
  '--drg-page-noise': pageNoiseImage,
} as JSX.CSSProperties

export function AppLayout(props: AppLayoutProps): JSX.Element {
  const resolvedVariant = (): NonNullable<AppLayoutProps['variant']> => props.variant ?? 'board'

  return (
    <main
      class={resolveClass(
        props.class,
        props.css,
        layoutRecipe.raw({
          dock: props.dockVisible === true ? 'visible' : 'hidden',
          variant: resolvedVariant(),
        }),
      )}
      style={layoutStyle}
    >
      {props.children}
    </main>
  )
}
