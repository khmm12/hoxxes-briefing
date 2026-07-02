import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'

const logoStyles = css.raw({
  display: 'block',
  aspectRatio: 'square',
  width: 'full',
  height: 'auto',
  maxWidth: 'full',
  maxHeight: 'full',
  objectFit: 'contain',
})

const brandlogoURL = /* @__PURE__ */ new URL('./brand-logo.svg', import.meta.url).href

export function BrandLogo(): JSX.Element {
  return <img alt="" aria-hidden="true" class={css(logoStyles)} src={brandlogoURL} />
}
