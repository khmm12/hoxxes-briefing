import type { JSX } from 'solid-js'
import { css, cva } from 'styled-system/css'
import { Eyebrow } from '~/shared/ui/eyebrow'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type StateScreenProps = WithStylingProps<{
  action?: JSX.Element
  body: string
  bodyTone?: 'default' | 'disabled'
  busy?: boolean
  eyebrow: string
  indicator?: JSX.Element
  passiveStatus?: string
  srStatus?: string
  title: string
  tone?: 'brand' | 'danger' | 'info' | 'warning'
}>

const indicatorRecipe = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    width: 'icon.lg',
    height: 'icon.lg',
    marginInline: 'auto',
    fontSize: '4rem',
  },
  variants: {
    tone: {
      brand: {
        color: 'brand',
      },
      danger: {
        color: 'danger',
      },
      info: {
        color: 'info',
      },
      warning: {
        color: 'warning',
      },
    },
  },
  defaultVariants: {
    tone: 'brand',
  },
})

const stateScreenFrameStyles = css.raw({
  position: 'relative',
  display: 'grid',
  width: '100%',
  minHeight: 'min(56rem, calc(100svh - 11rem))',
  placeItems: 'center',
  paddingBlockStart: 'calc(env(safe-area-inset-top) + var(--spacing-ui48))',
  paddingBlockEnd: 'calc(env(safe-area-inset-bottom) + var(--spacing-ui80))',
  paddingInline: 'ui16',
})

const stateScreenCoreStyles = css.raw({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateRows: {
    base: 'minmax(calc(0.875rem * 1.55), auto) var(--sizes-icon-lg) minmax(calc(1.5rem * 1.2 * 2), auto) minmax(calc(0.875rem * 1.55 * 3), auto) minmax(calc(0.875rem * 1.55), auto) var(--sizes-control-default)',
    md: 'minmax(calc(0.875rem * 1.55), auto) var(--sizes-icon-lg) minmax(calc(2rem * 1.2 * 2), auto) minmax(calc(1rem * 1.55 * 2), auto) minmax(calc(0.875rem * 1.55), auto) var(--sizes-control-default)',
  },
  gap: { base: 'ui8', md: 'ui12' },
  alignItems: 'center',
  justifyItems: 'stretch',
  width: 'min(100%, var(--sizes-content-state))',
  paddingBlock: 'ui16',
  paddingInline: 'ui0',
  textAlign: 'center',
})

const titleStyles = css.raw({
  color: 'text.primary',
  fontFamily: 'display',
  fontSize: { base: '1.5rem', md: '2rem' },
  fontWeight: '700',
  letterSpacing: '0.02em',
  lineHeight: '1.2',
})

const bodyRecipe = cva({
  base: {
    fontSize: { base: '0.875rem', md: '1rem' },
    lineHeight: '1.55',
  },
  variants: {
    tone: {
      default: {
        color: 'text.secondary',
      },
      disabled: {
        color: 'text.disabled',
      },
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

const passiveStatusStyles = css.raw({
  color: 'text.secondary',
  fontSize: '0.875rem',
  lineHeight: '1.55',
})

const actionRowStyles = css.raw({
  display: 'grid',
  width: '100%',
  placeItems: 'center',
  '& > *': {
    width: '100%',
  },
})

const statusRowStyles = css.raw({
  display: 'grid',
  width: '100%',
  placeItems: 'center',
})

const srOnlyStyles = css.raw({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
})

export function StateScreen(props: StateScreenProps): JSX.Element {
  const resolvedTone = () => props.tone ?? 'brand'

  return (
    <section
      class={resolveClass(props.class, props.css, stateScreenFrameStyles)}
      aria-busy={props.busy === true ? 'true' : 'false'}
    >
      <div class={css(stateScreenCoreStyles)}>
        <Eyebrow tone="brand">{props.eyebrow}</Eyebrow>
        <div class={css(indicatorRecipe.raw({ tone: resolvedTone() }))} aria-hidden="true">
          {props.indicator}
        </div>
        <div class={css(srOnlyStyles)} role="status" aria-live={props.busy === true ? 'polite' : 'off'}>
          {props.srStatus ?? ''}
        </div>
        <h1 class={css(titleStyles)}>{props.title}</h1>
        <p class={css(bodyRecipe.raw({ tone: props.bodyTone }))}>{props.body}</p>
        <div class={css(statusRowStyles)}>
          {props.passiveStatus != null ? <p class={css(passiveStatusStyles)}>{props.passiveStatus}</p> : null}
        </div>
        <div class={css(actionRowStyles)}>{props.action}</div>
      </div>
    </section>
  )
}
