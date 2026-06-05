import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { BrandLogo } from './BrandLogo'

type WeeklyBrandBlockProps = {
  slogan: string
}

// Mobile: logo + title on one line, slogan full-width below. Desktop: the
// title/slogan stack sits next to the logo, vertically centered against it.
const blockStyles = css.raw({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  gridTemplateAreas: { base: '"logo title" "slogan slogan"', lg: '"logo title" "logo slogan"' },
  columnGap: { base: 'ui12', lg: 'ui16' },
  rowGap: { base: 'ui8', lg: 'ui2' },
  alignItems: 'center',
})

const logoFrameStyles = css.raw({
  gridArea: 'logo',
  width: { base: 'ui32', lg: 'ui40' },
  height: { base: 'ui32', lg: 'ui40' },
})

const brandTitleStyles = css.raw({
  gridArea: 'title',
  color: 'text.primary',
  fontFamily: 'display',
  fontSize: { base: '1.25rem', lg: '1.5rem' },
  fontWeight: '700',
  letterSpacing: '0.04em',
  lineHeight: '1.2',
  textTransform: 'uppercase',
})

// Slogans are sacred: never clamp them.
const sloganStyles = css.raw({
  gridArea: 'slogan',
  color: 'text.secondary',
  fontSize: { base: '0.8125rem', lg: '0.9375rem' },
  lineHeight: '1.55',
})

export function WeeklyBrandBlock(props: WeeklyBrandBlockProps): JSX.Element {
  return (
    <div class={css(blockStyles)}>
      <div class={css(logoFrameStyles)}>
        <BrandLogo />
      </div>
      <h1 class={css(brandTitleStyles)}>Hoxxes Briefing</h1>
      <p class={css(sloganStyles)}>{props.slogan}</p>
    </div>
  )
}
