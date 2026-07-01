import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { BrandBlock } from './BrandBlock'

describe('BrandBlock', () => {
  it('shows the brand title and the given slogan', () => {
    const { getByText, getByRole } = render(() => <BrandBlock slogan="Rock and Stone!" />)

    expect(getByRole('heading', { name: 'Hoxxes Briefing' })).toBeInTheDocument()
    expect(getByText('Rock and Stone!')).toBeInTheDocument()
  })
})
