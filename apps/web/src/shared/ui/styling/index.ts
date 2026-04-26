import type { JSX } from 'solid-js'
import { css } from 'styled-system/css'
import type { SystemStyleObject, WithCss } from 'styled-system/types'

export type StylingClass = JSX.HTMLAttributes<HTMLElement>['class']

export type StylingProps = {
  class?: StylingClass
} & WithCss

export type WithStylingProps<T> = T & StylingProps

export function resolveClass(
  className: StylingProps['class'],
  cssProp: StylingProps['css'],
  ...styles: SystemStyleObject[]
): JSX.ClassList {
  const resolved = css(...styles, cssProp)

  if (className == null || className === false) {
    return [resolved]
  }

  if (Array.isArray(className)) {
    return [resolved, ...className]
  }

  return [resolved, className]
}
