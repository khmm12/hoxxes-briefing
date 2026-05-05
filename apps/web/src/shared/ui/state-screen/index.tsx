import { Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
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
  width: 'content.state',
  maxWidth: 'full',
  marginInline: 'auto',
  placeItems: 'center',
})

const stateScreenCoreStyles = css.raw({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: { base: 'ui8', md: 'ui16' },
  alignItems: 'center',
  justifyItems: 'stretch',
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
  marginTop: 'ui4',
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
  width: 'full',
  placeItems: 'center',
  '& > *': {
    width: 'full',
  },
})

const statusRowStyles = css.raw({
  display: 'grid',
  width: 'full',
  placeItems: 'center',
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
        <h1 class={css(titleStyles)}>{props.title}</h1>
        <p class={css(bodyRecipe.raw({ tone: props.bodyTone }))}>{props.body}</p>
        <Show when={props.passiveStatus}>
          <div class={css(statusRowStyles)}>
            <p class={css(passiveStatusStyles)}>{props.passiveStatus}</p>
          </div>
        </Show>
        <Show when={props.action}>
          <div class={css(actionRowStyles)}>{props.action}</div>
        </Show>
      </div>
    </section>
  )
}
