import { msg } from '@lingui/core/macro'
import type { JSX } from 'solid-js'
import { css } from 'styled-system/css'
import { token } from 'styled-system/tokens'
import { useI18n } from '~/shared/i18n'
import { BrandLogo } from './BrandLogo'

type WeeklyBrandBlockProps = {
  slogan: JSX.Element
}

const brandClusterStyles = css.raw({
  display: 'grid',
  gridTemplateColumns: {
    base: `${token('spacing.ui40')} minmax(0, 1fr)`,
    md: `${token('spacing.ui48')} minmax(0, 1fr)`,
  },
  gap: { base: 'ui12', md: 'ui16' },
  alignItems: 'start',
})

const logoFrameStyles = css.raw({
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  width: { base: token('spacing.ui40'), md: token('spacing.ui48') },
  height: { base: token('spacing.ui40'), md: token('spacing.ui48') },
  paddingBlock: { base: 'ui0', md: 'ui2' },
  paddingInline: { base: 'ui0', md: 'ui2' },
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
  minWidth: 0,
})

const eyebrowStyles = css.raw({
  color: 'brand.hover',
  fontFamily: 'display',
  fontSize: '0.875rem',
  fontWeight: '700',
  letterSpacing: '0.04em',
  lineHeight: '1.333',
  textTransform: 'uppercase',
  hideBelow: 'md',
})

const brandTitleStyles = css.raw({
  color: 'text.primary',
  fontFamily: 'display',
  fontSize: { base: '1.5rem', md: '2rem' },
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
