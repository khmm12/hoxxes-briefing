import { describe, expect, it } from 'vitest'
import { StateScreen } from '~/shared/ui/state-screen'
import { renderWithProviders } from '~test/render'

describe('StateScreen', () => {
  it('assertively announces a terminal state without taking focus', () => {
    const { getByRole } = renderWithProviders(() => (
      <StateScreen eyebrow="e" title="Could not load the briefing" body="b" />
    ))

    const $title = getByRole('heading', { level: 1, name: 'Could not load the briefing' })
    const $status = getByRole('alert')

    expect($title).not.toHaveAttribute('tabindex')
    expect($title).not.toHaveFocus()
    expect($status).toHaveAttribute('aria-live', 'assertive')
    expect($status).toHaveAttribute('aria-atomic', 'true')
    expect($status).toHaveTextContent('Could not load the briefing. b')
  })

  it('renders the eyebrow, title, and body', () => {
    const { getByRole, getByText } = renderWithProviders(() => (
      <StateScreen eyebrow="Mining Morkite" title="Could not load the board" body="Try again later." />
    ))

    expect(getByText('Mining Morkite')).toBeInTheDocument()
    expect(getByRole('heading', { level: 1, name: 'Could not load the board' })).toBeInTheDocument()
    expect(getByRole('alert')).toHaveTextContent('Could not load the board. Try again later.')
  })

  it('marks the section busy only when told to', () => {
    const idle = renderWithProviders(() => <StateScreen eyebrow="e" title="t" body="b" />)
    const busy = renderWithProviders(() => <StateScreen eyebrow="e" title="t" body="b" busy={true} />)

    expect(idle.container.querySelector('section')).toHaveAttribute('aria-busy', 'false')
    expect(busy.container.querySelector('section')).toHaveAttribute('aria-busy', 'true')
    expect(idle.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
    expect(busy.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(busy.getByRole('status').closest('[aria-busy="true"]')).toBeNull()
  })

  it('omits the passive status row when none is given', () => {
    const { queryByText } = renderWithProviders(() => <StateScreen eyebrow="e" title="t" body="b" />)

    expect(queryByText('Checked a moment ago')).toBeNull()
  })

  it('renders the passive status when given', () => {
    const { getByText } = renderWithProviders(() => (
      <StateScreen eyebrow="e" title="t" body="b" passiveStatus="Checked a moment ago" />
    ))

    expect(getByText('Checked a moment ago')).toBeInTheDocument()
  })

  it('omits the action row when no action is given', () => {
    const { queryByRole } = renderWithProviders(() => <StateScreen eyebrow="e" title="t" body="b" />)

    expect(queryByRole('button')).toBeNull()
  })

  it('renders the given action', () => {
    const { getByRole } = renderWithProviders(() => (
      <StateScreen eyebrow="e" title="t" body="b" action={<button type="button">Try again</button>} />
    ))

    expect(getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('renders an indicator when given', () => {
    const { getByLabelText, container } = renderWithProviders(() => (
      <StateScreen eyebrow="e" title="t" body="b" indicator={<svg aria-label="alert" />} />
    ))

    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull()
    expect(getByLabelText('alert')).toBeInTheDocument()
  })
})
