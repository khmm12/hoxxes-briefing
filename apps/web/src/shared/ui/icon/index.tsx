import { createMemo, merge, omit } from 'solid-js'
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

export type GlyphIconProps = IconProps & { d: string; fillRule?: 'evenodd' | 'nonzero' }

// Every glyph lives on a single 24×24 grid and renders at the slot size —
// solid pictograms with knocked-out detail, no stroke icons.
export function GlyphIcon(props: GlyphIconProps): JSX.Element {
  const className = createMemo(() => resolveClass(props.class, props.css, iconStyles), { lazy: true })

  const iconProps = merge(omit(props, 'class', 'css', 'd', 'fillRule'), {
    xmlns: 'http://www.w3.org/2000/svg',
    get class() {
      return className()
    },
  })

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps}>
      <path d={props.d} fill="currentColor" fill-rule={props.fillRule} />
    </svg>
  )
}

// UI glyph set traced into designs/hoxxes-briefing.pen (`glyph/ui-*`):
// warning-generic and mutator-generic follow the in-game placeholder icons,
// alert is the same family's octagon sign, refresh and offline derive from
// Material rounded-filled forms; the rest are original in the same style.

const refresh =
  'M11.93 20.62c-2.39 0-4.42-0.84-6.1-2.52-1.69-1.68-2.53-3.72-2.53-6.1 0-2.38 0.84-4.42 2.53-6.11 1.68-1.69 3.71-2.54 6.1-2.54 1.51 0 2.85 0.3 4.01 0.91 1.16 0.61 2.15 1.47 2.99 2.57l0-2.58c0-0.25 0.08-0.46 0.25-0.64 0.16-0.17 0.37-0.26 0.63-0.26 0.26 0 0.48 0.09 0.65 0.26 0.18 0.18 0.27 0.39 0.27 0.64l0 5.2c0 0.33-0.12 0.61-0.35 0.84-0.24 0.22-0.52 0.33-0.85 0.33l-5.23 0c-0.25 0-0.46-0.08-0.62-0.26-0.17-0.17-0.25-0.38-0.25-0.63 0-0.26 0.08-0.46 0.26-0.63 0.17-0.17 0.39-0.25 0.64-0.25l3.2 0c-0.65-0.93-1.44-1.69-2.35-2.26-0.92-0.58-2-0.86-3.25-0.86-1.75 0-3.24 0.6-4.45 1.82-1.22 1.22-1.83 2.7-1.83 4.45 0 1.75 0.61 3.23 1.83 4.45 1.21 1.22 2.7 1.83 4.45 1.83 1.11 0 2.16-0.28 3.15-0.84 0.98-0.56 1.74-1.32 2.3-2.29 0.18-0.27 0.42-0.46 0.72-0.57 0.3-0.12 0.6-0.11 0.9 0.02 0.3 0.12 0.51 0.31 0.62 0.59 0.12 0.27 0.11 0.54-0.02 0.81-0.73 1.42-1.79 2.54-3.16 3.38-1.38 0.83-2.88 1.24-4.51 1.24z'

const alert =
  'M16.06 2.21l5.73 5.73 0 8.12-5.73 5.73-8.12 0-5.73-5.73 0-8.12 5.73-5.73z m-0.62 1.49l4.86 4.86 0 6.88-4.86 4.86-6.88 0-4.86-4.86 0-6.88 4.86-4.86z m-4.54 2.9l2.2 0-0.4 6.9-1.4 0z m1.1 11.1a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z'

// A crossed-out board panel — the board could not be loaded. There is no
// "empty board" state: a deep dive exists every week.
const boardUnavailable =
  'M5 3.5l14 0 2 2 0 14-2 2-14 0-2-2 0-14z m-0.4 3.1l0 11.8 1.5 1.5 11.8 0 1.5-1.5 0-11.8-1.5-1.5-11.8 0z m10.33 0.85l2.12 2.12-2.93 2.93 2.93 2.93-2.12 2.12-2.93-2.93-2.93 2.93-2.12-2.12 2.93-2.93-2.93-2.93 2.12-2.12 2.93 2.93z'

const offline =
  'M19.6 21.73l-9.32-9.3c-0.71 0.16-1.35 0.41-1.95 0.73-0.6 0.33-1.15 0.7-1.65 1.12-0.25 0.2-0.53 0.31-0.84 0.33-0.31 0.03-0.58-0.08-0.81-0.31-0.24-0.23-0.35-0.5-0.33-0.81 0.02-0.31 0.14-0.57 0.38-0.79 0.48-0.43 1-0.82 1.54-1.15 0.55-0.33 1.18-0.64 1.88-0.93l-2.77-2.77c-0.59 0.3-1.16 0.64-1.72 1.01-0.56 0.38-1.08 0.77-1.56 1.19-0.25 0.22-0.53 0.33-0.85 0.34-0.32 0.01-0.59-0.11-0.82-0.34-0.24-0.23-0.34-0.5-0.32-0.81 0.03-0.31 0.16-0.57 0.39-0.79 0.5-0.45 1.02-0.87 1.55-1.25 0.53-0.38 1.08-0.72 1.63-1.02l-1.78-1.78c-0.15-0.15-0.23-0.33-0.23-0.54 0-0.21 0.08-0.38 0.23-0.53 0.15-0.15 0.33-0.23 0.54-0.23 0.21 0 0.39 0.08 0.54 0.23l17.35 17.35c0.15 0.15 0.22 0.32 0.22 0.52 0 0.2-0.07 0.37-0.22 0.53-0.15 0.15-0.33 0.22-0.54 0.22-0.21 0-0.39-0.07-0.54-0.22z m-9.17-1.58c-0.46-0.45-0.68-0.97-0.68-1.58 0-0.59 0.22-1.12 0.68-1.57 0.45-0.45 0.97-0.68 1.57-0.68 0.6 0 1.12 0.23 1.58 0.68 0.45 0.45 0.67 0.98 0.67 1.57 0 0.61-0.22 1.13-0.67 1.58-0.46 0.45-0.98 0.68-1.58 0.68-0.6 0-1.12-0.23-1.57-0.68z m8.57-5.87c-0.23 0.23-0.51 0.34-0.82 0.34-0.32 0-0.61-0.1-0.86-0.32-0.53-0.45-1.12-0.92-1.78-1.42-0.66-0.5-1.26-0.96-1.81-1.38l-0.3-0.22c-0.25-0.19-0.31-0.43-0.18-0.73 0.13-0.3 0.37-0.42 0.7-0.35 0.95 0.18 1.82 0.48 2.61 0.89 0.79 0.41 1.56 0.93 2.29 1.56 0.25 0.22 0.4 0.48 0.44 0.8 0.04 0.32-0.06 0.59-0.29 0.83z m4.23-4.23c-0.24 0.23-0.52 0.35-0.84 0.34-0.33-0.01-0.61-0.12-0.86-0.34-1.39-1.17-2.87-2.09-4.46-2.77-1.58-0.69-3.27-1.03-5.07-1.03-0.62 0-1.21 0.04-1.77 0.11-0.57 0.08-1.05 0.18-1.43 0.32-0.3 0.1-0.59 0.07-0.86-0.07-0.28-0.14-0.46-0.36-0.56-0.66-0.1-0.3-0.08-0.6 0.06-0.89 0.14-0.29 0.36-0.48 0.66-0.56 0.6-0.18 1.23-0.31 1.89-0.39 0.66-0.07 1.33-0.11 2.01-0.11 2.13 0 4.15 0.4 6.04 1.21 1.89 0.81 3.59 1.89 5.11 3.24 0.23 0.22 0.36 0.48 0.39 0.79 0.02 0.31-0.08 0.58-0.31 0.81z'

const notFound =
  'M12 2.3a9.7 9.7 0 1 1 0 19.4 9.7 9.7 0 1 1 0-19.4z m0 1.8a7.9 7.9 0 1 0 0 15.8 7.9 7.9 0 1 0 0-15.8z m4.3 3.6l-3.1 5.5-5.5 3.1 3.1-5.5z'

const warningGeneric =
  'M8.3 2.4l7.4 0 7.9 15.6-2.4 3.5-18.4 0-2.4-3.5z m0.8 1.5l6.2 0 6.5 14.3-1.9 1.8-15.8 0-1.9-1.8z m0.7 2.7l4.7 0-1.1 7.7-2.5 0z m2.3 11.4a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z'

const mutatorGeneric =
  'M3 2.7l18 0 2.5 3.7-7.8 15.4-7.4 0-7.8-15.4z m0.79 1.5l16.42 0 1.55 2.3-6.98 13.8-5.56 0-6.98-13.8z m7.38 4.31l0.26-1.57 1.14 0 0.26 1.57 0.77 0.32 1.29-0.93 0.81 0.81-0.93 1.29 0.32 0.77 1.57 0.26 0 1.14-1.57 0.26-0.32 0.77 0.93 1.29-0.81 0.81-1.29-0.93-0.77 0.32-0.26 1.57-1.14 0-0.26-1.57-0.77-0.32-1.29 0.93-0.81-0.81 0.93-1.29-0.32-0.77-1.57-0.26 0-1.14 1.57-0.26 0.32-0.77-0.93-1.29 0.81-0.81 1.29 0.93z m0.83 4.94a1.85 1.85 0 1 0 0-3.7 1.85 1.85 0 0 0 0 3.7z m0-0.8a1.05 1.05 0 1 0 0-2.1 1.05 1.05 0 0 0 0 2.1z'

const objectivePrimary =
  'M12 2l8.66 5 0 10-8.66 5-8.66-5 0-10z m-7.19 5.85l0 8.3 7.19 4.15 7.19-4.15 0-8.3-7.19-4.15z m7.19-0.45l3.98 2.3 0 4.6-3.98 2.3-3.98-2.3 0-4.6z'

const objectiveSecondary =
  'M12 2.6l9.4 9.4-9.4 9.4-9.4-9.4z m0 2.3l7.1 7.1-7.1 7.1-7.1-7.1z m0 4l3.1 3.1-3.1 3.1-3.1-3.1z'

export function RefreshIcon(props: IconProps): JSX.Element {
  return <GlyphIcon d={refresh} {...props} />
}

export function AlertIcon(props: IconProps): JSX.Element {
  return <GlyphIcon d={alert} fillRule="evenodd" {...props} />
}

export function BoardUnavailableIcon(props: IconProps): JSX.Element {
  return <GlyphIcon d={boardUnavailable} fillRule="evenodd" {...props} />
}

export function OfflineIcon(props: IconProps): JSX.Element {
  return <GlyphIcon d={offline} {...props} />
}

export function NotFoundIcon(props: IconProps): JSX.Element {
  return <GlyphIcon d={notFound} {...props} />
}

export function WarningGenericIcon(props: IconProps): JSX.Element {
  return <GlyphIcon d={warningGeneric} fillRule="evenodd" {...props} />
}

export function MutatorGenericIcon(props: IconProps): JSX.Element {
  return <GlyphIcon d={mutatorGeneric} fillRule="evenodd" {...props} />
}

export function ObjectivePrimaryIcon(props: IconProps): JSX.Element {
  return <GlyphIcon d={objectivePrimary} fillRule="evenodd" {...props} />
}

export function ObjectiveSecondaryIcon(props: IconProps): JSX.Element {
  return <GlyphIcon d={objectiveSecondary} fillRule="evenodd" {...props} />
}
