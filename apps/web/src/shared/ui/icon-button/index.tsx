import { omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { Spinner } from '~/shared/ui/spinner'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type NativeButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'class' | 'css'>

export type IconButtonProps = WithStylingProps<
  NativeButtonProps & {
    busy?: boolean
    children: JSX.Element
  }
>

// Icon button: a 32px ghost square holding a single 16px glyph — bare at
// rest, surface step on hover, outcome flashes ride `data-flash`. Busy
// swaps the glyph for the spinner and implies disabled, without the
// disabled dim. The border belongs to hover alone — flashes tint only the
// glyph and the surface; while one is held, the hover border takes the
// outcome tone. Painted transparent at rest so hover never shifts layout.
const iconButtonStyles = css.raw({
  position: 'relative',
  display: 'inline-grid',
  placeItems: 'center',
  width: '8',
  height: '8',
  flexShrink: 0,
  padding: '0',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderRadius: 'md',
  background: 'transparent',
  color: 'text.secondary',
  fontSize: '[token(sizes.icon.16)]',
  cursor: 'pointer',
  transitionDuration: 'press',
  transitionProperty: '[background-color, border-color, color]',
  transitionTimingFunction: 'press',
  // The visual box stays 32; the touch target stays ≥44.
  _before: {
    content: '""',
    position: 'absolute',
    inset: '[-6px]',
  },
  _hover: {
    borderColor: 'border.subtle',
    background: 'surface.sunken',
    color: 'text.primary',
  },
  // Busy disables the control for input, but it is working, not disabled —
  // `_hover` excludes `:disabled`, so without this the border and surface
  // vanish under the cursor on press and jump back on settle.
  '&[data-busy]:is(:hover, [data-hover])': {
    borderColor: 'border.subtle',
    background: 'surface.sunken',
    color: 'text.primary',
  },
  _focusVisible: {
    layerStyle: 'focusRing',
  },
  _disabled: {
    cursor: 'default',
    opacity: 'disabled',
    '&[data-busy]': {
      opacity: 'full',
    },
  },
  _flashSuccess: {
    animationStyle: 'flashSuccess',
    _hover: {
      borderColor: 'success.border',
    },
  },
  _flashDanger: {
    animationStyle: 'flashDanger',
    _hover: {
      borderColor: 'danger.border',
    },
  },
})

export function IconButton(props: IconButtonProps): JSX.Element {
  const rest = omit(props, 'busy', 'children', 'class', 'css', 'disabled')

  return (
    <button
      {...rest}
      class={resolveClass(props.class, props.css, iconButtonStyles)}
      data-busy={props.busy === true ? '' : undefined}
      disabled={props.disabled || props.busy || undefined}
    >
      {props.busy === true ? <Spinner /> : props.children}
    </button>
  )
}
