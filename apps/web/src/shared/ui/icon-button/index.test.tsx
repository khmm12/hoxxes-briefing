import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@solidjs/testing-library'
import { IconButton } from '~/shared/ui/icon-button'

describe('IconButton', () => {
  it('renders its children when idle', () => {
    const { getByRole, queryByText } = render(() => <IconButton>glyph</IconButton>)

    expect(getByRole('button')).not.toBeDisabled()
    expect(queryByText('glyph')).not.toBeNull()
  })

  it('swaps the children for a spinner and disables the control while busy', () => {
    const { getByRole, queryByText } = render(() => <IconButton busy={true}>glyph</IconButton>)

    const button = getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-busy', '')
    expect(queryByText('glyph')).toBeNull()
    expect(button.querySelector('svg')).not.toBeNull()
  })

  it('stays disabled when explicitly disabled, without the busy marker', () => {
    const { getByRole } = render(() => <IconButton disabled={true}>glyph</IconButton>)

    const button = getByRole('button')
    expect(button).toBeDisabled()
    expect(button).not.toHaveAttribute('data-busy')
  })

  it('forwards click handling and native attributes', () => {
    const onClick = vi.fn()
    const { getByRole } = render(() => (
      <IconButton onClick={onClick} aria-label="refresh">
        glyph
      </IconButton>
    ))

    const button = getByRole('button', { name: 'refresh' })
    fireEvent.click(button)

    expect(onClick).toHaveBeenCalledOnce()
  })
})
