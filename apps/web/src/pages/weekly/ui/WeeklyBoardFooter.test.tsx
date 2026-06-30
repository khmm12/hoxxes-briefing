import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '~test/render'
import { WeeklyBoardFooter } from './WeeklyBoardFooter'

describe('WeeklyBoardFooter', () => {
  it('salutes and credits the author with links out to GitHub', () => {
    const { getByText, getByRole } = renderWithProviders(() => <WeeklyBoardFooter />)

    expect(getByText('Rock and Stone!')).toBeInTheDocument()

    const author = getByRole('link', { name: 'khmm12' })
    expect(author).toHaveAttribute('href', 'https://github.com/khmm12')
    expect(author).toHaveAttribute('target', '_blank')
    expect(author).toHaveAttribute('rel', 'noopener noreferrer')

    const source = getByRole('link', { name: 'Source on GitHub' })
    expect(source).toHaveAttribute('href', 'https://github.com/khmm12/hoxxes-briefing')
  })
})
