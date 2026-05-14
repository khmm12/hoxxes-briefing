import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import { BrandLogo } from './BrandLogo'

type WeeklyBrandBlockProps = {
  slogan: JSX.Element
}

const brandClusterStyles = css.raw({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  gap: { base: 'ui12', md: 'ui16' },
  alignItems: 'start',
})

const logoFrameStyles = css.raw({
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  width: { base: 'ui40', md: 'ui48', lg: 'ui56' },
  height: { base: 'ui40', md: 'ui48', lg: 'ui56' },
  paddingBlock: { base: 'ui2', lg: 'ui4' },
  paddingInline: { base: 'ui2', lg: 'ui4' },
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border.subtle',
  borderRadius: 'ui12',
  background: 'surface.sunken',
  overflow: 'hidden',
})

const brandCopyStyles = css.raw({
  display: 'grid',
  gap: 'ui4',
  minWidth: '0',
})

const eyebrowStyles = css.raw({
  display: { base: 'none', md: 'block' },
  color: 'brand.hover',
  fontFamily: 'display',
  fontSize: { base: '0.75rem', md: '0.875rem' },
  fontWeight: '700',
  letterSpacing: '0.04em',
  lineHeight: '1.333',
  textTransform: 'uppercase',
})

const brandTitleStyles = css.raw({
  color: 'text.primary',
  fontFamily: 'display',
  fontSize: { base: '1.5rem', md: '2rem', xl: '2.25rem' },
  fontWeight: '700',
  letterSpacing: '0.04em',
  lineHeight: '1.2',
  textTransform: 'uppercase',
})

const sloganStyles = css.raw({
  color: 'text.secondary',
  display: '-webkit-box',
  fontSize: { base: '0.875rem', md: '1rem' },
  lineHeight: '1.55',
  overflow: 'hidden',
  lineClamp: 2,
})

export function WeeklyBrandBlock(props: WeeklyBrandBlockProps): JSX.Element {
  const i18n = useI18n()

  return (
    <div class={css(brandClusterStyles)}>
      <div class={css(logoFrameStyles)}>
        <BrandLogo />
      </div>
      <div class={css(brandCopyStyles)}>
        <p class={css(eyebrowStyles)}>{i18n._(msg`This week's Deep Dives`)}</p>
        <h1 class={css(brandTitleStyles)}>Hoxxes Briefing</h1>
        <p class={css(sloganStyles)}>{props.slogan}</p>
      </div>
    </div>
  )
}
