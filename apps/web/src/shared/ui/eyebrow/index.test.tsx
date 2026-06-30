import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { Eyebrow } from '~/shared/ui/eyebrow'

describe('Eyebrow', () => {
  it('renders as a <p> by default', () => {
    const { container, getByText } = render(() => <Eyebrow>Mining Morkite</Eyebrow>)

    expect(getByText('Mining Morkite').tagName).toBe('P')
    expect(container.querySelector('p')).not.toBeNull()
  })

  it('renders as the given element', () => {
    const { getByText } = render(() => <Eyebrow as="span">Mining Morkite</Eyebrow>)

    expect(getByText('Mining Morkite').tagName).toBe('SPAN')
  })

  it.each(['primary', 'danger', 'info'] as const)('accepts the %s tone without throwing', (tone) => {
    const { getByText } = render(() => <Eyebrow tone={tone}>Mining Morkite</Eyebrow>)

    expect(getByText('Mining Morkite')).toBeInTheDocument()
  })
})
