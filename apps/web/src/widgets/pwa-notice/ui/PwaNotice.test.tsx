import { describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@solidjs/testing-library'
import { renderWithProviders } from '~test/render'
import { PwaNotice } from './PwaNotice'

describe('PwaNotice', () => {
  it('renders the update copy', () => {
    const { getByText, getByRole } = renderWithProviders(() => <PwaNotice onReload={vi.fn()} />)

    expect(getByText('New version ready')).toBeInTheDocument()
    expect(getByText('Reload for the latest app version.')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Update app' })).toBeInTheDocument()
  })

  it('calls onReload when the update button is clicked', () => {
    const onReload = vi.fn()
    const { getByRole } = renderWithProviders(() => <PwaNotice onReload={onReload} />)

    fireEvent.click(getByRole('button', { name: 'Update app' }))

    expect(onReload).toHaveBeenCalledOnce()
  })
})
