import { merge, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type ForbiddenIconProps = 'class' | 'css' | 'preserveAspectRatio' | 'viewBox' | 'xmlns'
type SvgProps = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, ForbiddenIconProps>

export type IconProps = WithStylingProps<SvgProps>

const iconStyles = css.raw({
  display: 'inline-block',
  flexShrink: 0,
  width: '[1em]',
  height: '[1em]',
  color: 'current',
})

export function RefreshIcon(props: IconProps): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps(props)}>
      <path
        d="M20 7v5h-5"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
      <path
        d="M19.2 12A7.5 7.5 0 1 1 17 6.7L20 9.7"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
    </svg>
  )
}

export function AlertIcon(props: IconProps): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" {...iconProps(props)}>
      <path
        d="M32 6 58 20v24L32 58 6 44V20L32 6Z"
        fill="none"
        stroke="currentColor"
        stroke-linejoin="round"
        stroke-width="4"
      />
      <path d="M23 23 41 41" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" />
      <path d="M41 23 23 41" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" />
    </svg>
  )
}

export function EmptyBoardIcon(props: IconProps): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" {...iconProps(props)}>
      <path
        d="M12 14h40a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z"
        fill="none"
        stroke="currentColor"
        stroke-linejoin="round"
        stroke-width="4"
      />
      <path d="M18 28h22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" />
      <path d="M18 38h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" />
      <path d="M12 56 54 8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" />
    </svg>
  )
}

export function OfflineIcon(props: IconProps): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" {...iconProps(props)}>
      <path d="M8 24c14-11 34-11 48 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" />
      <path d="M18 36c8-6 20-6 28 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" />
      <circle cx="32" cy="48" r="4" fill="currentColor" />
      <path d="M13 13 51 51" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" />
    </svg>
  )
}

export function NotFoundIcon(props: IconProps): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" {...iconProps(props)}>
      <path d="M16 6h26l14 14v38H16V6Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4" />
      <path d="M42 6v16h14" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4" />
      <path
        d="M25 30c0-5 4-8 9-8 5.5 0 9 3 9 7.5 0 6-9 6-9 12.5"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="4"
      />
      <circle cx="34" cy="50" r="3.5" fill="currentColor" />
    </svg>
  )
}

export function WarningGlyphIcon(props: IconProps): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps(props)}>
      <path d="M12 4 20 20H4L12 4Z" fill="currentColor" />
    </svg>
  )
}

export function MutatorGlyphIcon(props: IconProps): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps(props)}>
      <path d="M8 5.1h8l4 6.9-4 6.9H8L4 12l4-6.9Z" fill="currentColor" />
    </svg>
  )
}

export function PrimaryObjectiveIcon(props: IconProps): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps(props)}>
      <rect width="16" height="16" x="4" y="4" fill="currentColor" rx="4" />
    </svg>
  )
}

export function SecondaryObjectiveIcon(props: IconProps): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps(props)}>
      <rect width="16" height="16" x="4" y="4" fill="currentColor" rx="4" transform="rotate(45 12 12)" />
    </svg>
  )
}

function iconProps(props: IconProps): JSX.SvgSVGAttributes<SVGSVGElement> {
  return merge(omit(props, 'class', 'css'), {
    xmlns: 'http://www.w3.org/2000/svg',
    get class() {
      return resolveClass(props.class, props.css, iconStyles)
    },
  })
}
