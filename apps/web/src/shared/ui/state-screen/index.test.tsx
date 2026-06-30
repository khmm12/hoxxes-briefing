import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { StateScreen } from '~/shared/ui/state-screen'

describe('StateScreen', () => {
  it('renders the eyebrow, title, and body', () => {
    const { getByText } = render(() => (
      <StateScreen eyebrow="Mining Morkite" title="Could not load the board" body="Try again later." />
    ))

    expect(getByText('Mining Morkite')).toBeInTheDocument()
    expect(getByText('Could not load the board')).toBeInTheDocument()
    expect(getByText('Try again later.')).toBeInTheDocument()
  })

  it('marks the section busy only when told to', () => {
    const idle = render(() => <StateScreen eyebrow="e" title="t" body="b" />)
    const busy = render(() => <StateScreen eyebrow="e" title="t" body="b" busy={true} />)

    expect(idle.container.querySelector('section')).toHaveAttribute('aria-busy', 'false')
    expect(busy.container.querySelector('section')).toHaveAttribute('aria-busy', 'true')
  })

  it('omits the passive status row when none is given', () => {
    const { queryByText } = render(() => <StateScreen eyebrow="e" title="t" body="b" />)

    expect(queryByText('Checked a moment ago')).toBeNull()
  })

  it('renders the passive status when given', () => {
    const { getByText } = render(() => (
      <StateScreen eyebrow="e" title="t" body="b" passiveStatus="Checked a moment ago" />
    ))

    expect(getByText('Checked a moment ago')).toBeInTheDocument()
  })

  it('omits the action row when no action is given', () => {
    const { queryByRole } = render(() => <StateScreen eyebrow="e" title="t" body="b" />)

    expect(queryByRole('button')).toBeNull()
  })

  it('renders the given action', () => {
    const { getByRole } = render(() => (
      <StateScreen eyebrow="e" title="t" body="b" action={<button type="button">Try again</button>} />
    ))

    expect(getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('renders an indicator when given', () => {
    const { getByLabelText, container } = render(() => (
      <StateScreen eyebrow="e" title="t" body="b" indicator={<svg aria-label="alert" />} />
    ))

    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull()
    expect(getByLabelText('alert')).toBeInTheDocument()
  })
})
