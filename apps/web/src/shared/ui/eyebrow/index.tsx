import { Dynamic, type JSX } from '@solidjs/web'
import { cva } from 'styled-system/css'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type EyebrowProps = WithStylingProps<{
  as?: 'p' | 'span'
  children: JSX.Element
  tone?: 'brand' | 'danger' | 'info'
}>

const eyebrowRecipe = cva({
  base: {
    fontFamily: 'display',
    fontSize: '0.875rem',
    fontWeight: '700',
    letterSpacing: '0.04em',
    lineHeight: '1.333',
    textTransform: 'uppercase',
  },
  variants: {
    tone: {
      brand: {
        color: 'brand.hover',
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
    tone: 'brand',
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
