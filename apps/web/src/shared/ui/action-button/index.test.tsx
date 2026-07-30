import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { ActionControl } from '~/shared/ui/action-button'

describe('ActionControl', () => {
  it('renders as a <button> by default', () => {
    const { getByRole } = render(() => <ActionControl>Try again</ActionControl>)

    const control = getByRole('button', { name: 'Try again' })
    expect(control.tagName).toBe('BUTTON')
  })

  it('renders as a native <a> when asked', () => {
    const { getByRole } = render(() => (
      <ActionControl component="a" href="/board">
        Open board
      </ActionControl>
    ))

    const control = getByRole('link', { name: 'Open board' })
    expect(control).toHaveAttribute('href', '/board')
  })

  it('disables the button when busy and shows the spinner instead of stealing layout', () => {
    const { getByRole, queryByText } = render(() => <ActionControl busy={true}>Try again</ActionControl>)

    const control = getByRole('button')
    expect(control).toBeDisabled()
    expect(queryByText('Try again')).not.toBeNull()
    expect(control.querySelector('svg')).not.toBeNull()
  })

  it('does not disable an anchor while busy', () => {
    const { getByRole } = render(() => (
      <ActionControl component="a" href="/board" busy={true}>
        Open board
      </ActionControl>
    ))

    expect(getByRole('link')).not.toHaveAttribute('disabled')
  })

  it('respects an explicit disabled on a button', () => {
    const { getByRole } = render(() => <ActionControl disabled={true}>Try again</ActionControl>)

    expect(getByRole('button')).toBeDisabled()
  })

  it('renders the leading icon ahead of the children', () => {
    const { getByRole } = render(() => (
      <ActionControl leadingIcon={<svg data-testid="icon" />}>Try again</ActionControl>
    ))

    const control = getByRole('button')
    expect(control.firstElementChild?.tagName).toBe('svg')
  })

  it('omits the children wrapper when no children are given', () => {
    const { getByRole, container } = render(() => <ActionControl leadingIcon={<svg />} aria-label="icon only" />)

    expect(getByRole('button', { name: 'icon only' })).toBeInTheDocument()
    expect(container.querySelector('button > span')).toBeNull()
  })

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)('accepts the %s tone without throwing', (tone) => {
    const { getByRole } = render(() => <ActionControl tone={tone}>Try again</ActionControl>)

    expect(getByRole('button')).toBeInTheDocument()
  })
})
