import { describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@solidjs/testing-library'
import { AppCrashScreen } from '~/app/shell/AppCrashScreen'
import { renderWithProviders } from '~test/render'

describe('AppCrashScreen', () => {
  it('renders the crash copy', () => {
    const { getByText, getByRole } = renderWithProviders(() => <AppCrashScreen onRecover={vi.fn()} />)

    expect(getByText('App crashed')).toBeInTheDocument()
    expect(getByText('Reload the app and try again.')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Reload app' })).toBeInTheDocument()
  })

  it('calls onRecover when the reload button is clicked', () => {
    const onRecover = vi.fn()
    const { getByRole } = renderWithProviders(() => <AppCrashScreen onRecover={onRecover} />)

    fireEvent.click(getByRole('button', { name: 'Reload app' }))

    expect(onRecover).toHaveBeenCalledOnce()
  })
})
