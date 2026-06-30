import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { Spinner } from '~/shared/ui/spinner'

describe('Spinner', () => {
  it('renders as an aria-hidden glyph', () => {
    const { container } = render(() => <Spinner />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('path')).not.toBeNull()
  })
})
