import { describe, expect, it, vi } from 'vitest'
import { flush } from 'solid-js'
import { fireEvent } from '@solidjs/testing-library'
import { renderWithProviders } from '~test/render'
import type { BoardViewState } from '../model/briefing-page-state'
import { RefreshPanel } from './RefreshPanel'

const LIVE_STATE: BoardViewState = {
  source: 'network',
  expired: false,
  online: true,
  refreshing: false,
  refreshFailed: false,
}

describe('RefreshPanel', () => {
  it('reports the current board as loaded when live and online', () => {
    const { getByText, getByRole } = renderWithProviders(() => <RefreshPanel state={LIVE_STATE} onRefresh={() => {}} />)

    expect(getByText('Current board loaded.')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Refresh' })).not.toBeDisabled()
  })

  it('disables refresh and reports being offline when there is no connection', () => {
    const { getByText, getByRole } = renderWithProviders(() => (
      <RefreshPanel state={{ ...LIVE_STATE, online: false, source: 'cache' }} onRefresh={() => {}} />
    ))

    expect(getByText("Saved board loaded. You're offline for now.")).toBeInTheDocument()
    expect(getByRole('button', { name: 'Offline' })).toBeDisabled()
  })

  it('warns that only the last known board is shown once the cycle has expired', () => {
    const { getByText } = renderWithProviders(() => (
      <RefreshPanel state={{ ...LIVE_STATE, expired: true }} onRefresh={() => {}} />
    ))

    expect(getByText('Last known board only. This cycle already ended.')).toBeInTheDocument()
  })

  it('reports an in-progress refresh', () => {
    const { getByText, getByRole } = renderWithProviders(() => (
      <RefreshPanel state={{ ...LIVE_STATE, refreshing: true }} onRefresh={() => {}} />
    ))

    expect(getByText('Refreshing current board now.')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Refreshing...' })).toBeInTheDocument()
  })

  it('fires onRefresh when the refresh button is clicked', () => {
    const onRefresh = vi.fn()
    const { getByRole } = renderWithProviders(() => <RefreshPanel state={LIVE_STATE} onRefresh={onRefresh} />)

    fireEvent.click(getByRole('button', { name: 'Refresh' }))

    expect(onRefresh).toHaveBeenCalledOnce()
  })

  it('flashes the button success once a refresh settles without a failure', () => {
    const { getByRole } = renderWithProviders(() => <RefreshPanel state={LIVE_STATE} onRefresh={() => {}} />)
    const button = getByRole('button', { name: 'Refresh' })

    expect(button).not.toHaveAttribute('data-flash')

    fireEvent.click(button)

    expect(button).toHaveAttribute('data-flash', 'success')
  })

  it('flashes the button danger when the board reports a failed refresh', () => {
    const { getByRole } = renderWithProviders(() => (
      <RefreshPanel state={{ ...LIVE_STATE, refreshFailed: true }} onRefresh={() => {}} />
    ))
    const button = getByRole('button', { name: 'Refresh' })

    fireEvent.click(button)

    expect(button).toHaveAttribute('data-flash', 'danger')
  })

  it('clears the flash once its animation ends', () => {
    const { getByRole } = renderWithProviders(() => <RefreshPanel state={LIVE_STATE} onRefresh={() => {}} />)
    const button = getByRole('button', { name: 'Refresh' })

    fireEvent.click(button)
    expect(button).toHaveAttribute('data-flash', 'success')

    fireEvent.animationEnd(button)
    flush()

    expect(button).not.toHaveAttribute('data-flash')
  })
})
