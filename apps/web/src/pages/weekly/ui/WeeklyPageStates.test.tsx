import { describe, expect, it } from 'vitest'
import { BriefingRequestError } from '~/shared/api'
import { renderWithProviders } from '~test/render'
import { WeeklyErrorState, WeeklyLoadingState } from './WeeklyPageStates'

describe('WeeklyLoadingState', () => {
  it('tells the user it is pulling fresh dives when online', () => {
    const { getByText } = renderWithProviders(() => <WeeklyLoadingState dockVisible={false} online={true} />)

    expect(getByText('Mining Morkite')).toBeInTheDocument()
    expect(getByText('Pulling the latest deep dives now.')).toBeInTheDocument()
  })

  it('points at the on-device lookup when offline', () => {
    const { getByText } = renderWithProviders(() => <WeeklyLoadingState dockVisible={false} online={false} />)

    expect(getByText('Looking for deep dives on your device.')).toBeInTheDocument()
  })
})

describe('WeeklyErrorState', () => {
  it('offers a retry on a network failure while online', () => {
    const { getByRole, getByText } = renderWithProviders(() => (
      <WeeklyErrorState
        dockVisible={false}
        error={new BriefingRequestError('network', 'test')}
        online={true}
        onRetry={() => {}}
      />
    ))

    expect(getByText('Could not load the weekly board')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('explains the cache miss without a retry when offline', () => {
    const { getByText, queryByRole } = renderWithProviders(() => (
      <WeeklyErrorState
        dockVisible={false}
        error={new BriefingRequestError('network', 'test')}
        online={false}
        onRetry={() => {}}
      />
    ))

    expect(getByText('No saved board')).toBeInTheDocument()
    expect(queryByRole('button')).toBeNull()
  })
})
