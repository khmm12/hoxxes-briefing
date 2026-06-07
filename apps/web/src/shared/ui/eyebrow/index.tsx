import { Dynamic, type JSX } from '@solidjs/web'
import { cva } from 'styled-system/css'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type EyebrowProps = WithStylingProps<{
  as?: 'p' | 'span'
  children: JSX.Element
  tone?: 'danger' | 'info' | 'primary'
}>

const eyebrowRecipe = cva({
  base: {
    textStyle: 'eyebrow',
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

export function Eyebrow(props: EyebrowProps): JSX.Element {
  return (
    <Dynamic
      component={props.as ?? 'p'}
      class={resolveClass(props.class, props.css, eyebrowRecipe.raw({ tone: props.tone }))}
    >
      {props.children}
    </Dynamic>
  )
}
