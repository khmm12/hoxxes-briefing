import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { BrandLogo } from './BrandLogo'

describe('BrandLogo', () => {
  it('renders a decorative image with no accessible text', () => {
    const { container } = render(() => <BrandLogo />)
    const img = container.querySelector('img')

    expect(img).not.toBeNull()
    expect(img?.getAttribute('aria-hidden')).toBe('true')
    expect(img?.getAttribute('alt')).toBe('')
    expect(img?.getAttribute('src')).toMatch(/^data:image\/svg\+xml/)
  })
})
