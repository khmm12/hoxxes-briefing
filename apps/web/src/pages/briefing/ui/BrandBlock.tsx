import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { BrandLogo } from './BrandLogo'

type BrandBlockProps = {
  slogan: string
}

// Mobile: logo + title on one line, slogan full-width below. Desktop: the
// title/slogan stack sits next to the logo, vertically centered against it.
const blockStyles = css.raw({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  gridTemplateAreas: { base: '"logo title" "slogan slogan"', md: '"logo title" "logo slogan"' },
  columnGap: { base: '3', md: '4' },
  rowGap: { base: '2', md: '0.5' },
  alignItems: 'center',
})

const logoFrameStyles = css.raw({
  gridArea: 'logo',
  width: { base: '8', md: '10' },
  height: { base: '8', md: '10' },
})

const brandTitleStyles = css.raw({
  gridArea: 'title',
  color: 'text.primary',
  textStyle: { base: 'display.lg', md: 'display.xl' },
})

// Slogans are sacred: never clamp them.
const sloganStyles = css.raw({
  gridArea: 'slogan',
  color: 'text.secondary',
  textStyle: 'body.sm',
})

export function BrandBlock(props: BrandBlockProps): JSX.Element {
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
