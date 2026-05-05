import { omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type NativeSpinnerProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children' | 'class' | 'css'>

export type SpinnerProps = WithStylingProps<NativeSpinnerProps>

const spinnerStyles = css.raw({
  display: 'inline-block',
  flexShrink: 0,
  width: '[1em]',
  height: '[1em]',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: 'current',
  borderRightColor: 'transparent',
  borderRadius: 'full',
  animationStyle: 'spin',
})

export function Spinner(props: SpinnerProps): JSX.Element {
  const rest = omit(props, 'class', 'css')
  return <span aria-hidden="true" class={resolveClass(props.class, props.css, spinnerStyles)} {...rest} />
}
