import { omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { GlyphIcon, type IconProps } from '~/shared/ui/icon'
import { resolveClass } from '~/shared/ui/styling'

export type SpinnerProps = IconProps

// A glyph like any other (`glyph/spinner`): a 280° arc ring on the 24×24
// grid, animated by rotation at runtime. Busy states render it at regular
// icon slot sizes — no bespoke spinners.
const spinnerGlyph = 'M12 2.3a9.7 9.7 0 1 1-9.55 8.01l1.97 0.35a7.7 7.7 0 1 0 7.58-6.36z'

const spinnerStyles = css.raw({
  animationStyle: 'spin',
})

export function Spinner(props: SpinnerProps): JSX.Element {
  const rest = omit(props, 'class', 'css')
  return <GlyphIcon d={spinnerGlyph} class={resolveClass(props.class, props.css, spinnerStyles)} {...rest} />
}
