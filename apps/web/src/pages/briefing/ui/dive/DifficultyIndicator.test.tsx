import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '~test/render'
import { DifficultyIndicator } from './DifficultyIndicator'

describe('DifficultyIndicator', () => {
  it('exposes the complete assessment once and keeps split groups informational', () => {
    const assessment = 'Stage 2: Brutal for 1–2 miners. Demanding for 3–4 miners.'
    const { getByText, container } = renderWithProviders(() => (
      <DifficultyIndicator small="Brutal" full="Demanding" stage={2} />
    ))
    expect(getByText(assessment)).toBeInTheDocument()
    expect(getByText('1–2: Brutal').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'true')
    expect(getByText('3–4: Demanding')).toBeInTheDocument()
    expect(container.querySelectorAll('svg')).toHaveLength(2)
    expect(container.querySelector('button, [tabindex], [role="tooltip"], [title]')).toBeNull()
  })

  it('renders one icon and level name for matching grades', () => {
    const { getByText, container } = renderWithProviders(() => <DifficultyIndicator small="Easy" full="Easy" />)
    expect(getByText('Easy')).toBeInTheDocument()
    expect(getByText('Dive difficulty: Easy')).toBeInTheDocument()
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })
})
