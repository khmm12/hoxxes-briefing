import { Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { Eyebrow } from '~/shared/ui/eyebrow'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type StateScreenProps = WithStylingProps<{
  action?: JSX.Element
  body: string
  bodyTone?: 'default' | 'muted'
  busy?: boolean
  eyebrow: string
  indicator?: JSX.Element
  passiveStatus?: string
  title: string
  tone?: 'danger' | 'info' | 'primary'
}>

const indicatorRecipe = cva({
  base: {
    display: 'grid',
    placeItems: 'center',
    width: 'icon.64',
    height: 'icon.64',
    marginInline: 'auto',
    fontSize: '[token(sizes.icon.64)]',
  },
  variants: {
    tone: {
      primary: {
        color: 'primary',
      },
      danger: {
        color: 'danger',
      },
      info: {
        color: 'info',
      },
    },
  },
  defaultVariants: {
    tone: 'primary',
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
  gap: '4',
  alignItems: 'center',
  justifyItems: 'stretch',
  paddingBlock: '4',
  paddingInline: '0',
  textAlign: 'center',
})

const titleStyles = css.raw({
  color: 'text.primary',
  textStyle: 'headline',
})

const bodyRecipe = cva({
  base: {
    textStyle: 'body.md',
  },
  variants: {
    tone: {
      default: {
        color: 'text.secondary',
      },
      muted: {
        color: 'text.muted',
      },
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

const passiveStatusStyles = css.raw({
  color: 'text.secondary',
  textStyle: 'body.md',
})

const actionRowStyles = css.raw({
  display: 'grid',
  width: 'full',
  paddingBlockStart: '2',
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
  const resolvedTone = () => props.tone ?? 'primary'

  return (
    <>
      <p
        class={css({ srOnly: true })}
        role={props.busy === true ? 'status' : 'alert'}
        aria-live={props.busy === true ? 'polite' : 'assertive'}
        aria-atomic="true"
      >
        {props.title}. {props.body}
      </p>
      <section
        class={resolveClass(props.class, props.css, stateScreenFrameStyles)}
        aria-busy={props.busy === true ? 'true' : 'false'}
      >
        <div class={css(stateScreenCoreStyles)}>
          <Eyebrow tone="primary">{props.eyebrow}</Eyebrow>
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
    </>
  )
}
