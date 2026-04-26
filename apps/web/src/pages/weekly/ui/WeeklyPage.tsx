import { msg } from '@lingui/core/macro'
import { Meta, Title } from '@solidjs/meta'
import { createMemo, Errored, type JSX, Loading, Show } from 'solid-js'
import { useI18n } from '~/shared/i18n'
import { createOnlineStatus } from '~/shared/lib/create-online-status'
import { AppLayout } from '~/shared/ui/layout'
import { createWeeklyBoardQuery } from '../model/create-weekly-board-query'
import { deriveWeeklyBoardState } from '../model/weekly-page-state'
import { WeeklyBoard } from './WeeklyBoard'
import { WeeklyErrorState, WeeklyLoadingState } from './WeeklyPageStates'

type WeeklyBoardQuery = ReturnType<typeof createWeeklyBoardQuery>

type WeeklyPageProps = {
  dockVisible: boolean
}

type ReadyWeeklyBoardProps = {
  dockVisible: boolean
  online: boolean
  query: WeeklyBoardQuery
  onRefresh: () => void
}

export function WeeklyPage(props: WeeklyPageProps): JSX.Element {
  const i18n = useI18n()
  const online = createOnlineStatus()
  const boardQuery = createWeeklyBoardQuery()

  const refreshBoard = (): void => {
    boardQuery.refresh()
  }

  return (
    <>
      <Title>{i18n._(msg`Hoxxes Briefing | Orbital Briefing`)}</Title>
      <Meta
        name="description"
        content={i18n._(
          msg`Hoxxes Briefing is the current Deep Rock Galactic Deep Dive and Elite Deep Dive briefing in one phone-friendly board.`,
        )}
      />

      <Errored
        fallback={(error, reset) => (
          <Show
            when={!boardQuery.pending}
            fallback={<WeeklyLoadingState dockVisible={props.dockVisible} online={online()} />}
          >
            <WeeklyErrorState
              dockVisible={props.dockVisible}
              error={error}
              online={online()}
              onRetry={() => reset()}
              reset={reset}
            />
          </Show>
        )}
      >
        <Loading fallback={<WeeklyLoadingState dockVisible={props.dockVisible} online={online()} />}>
          <ReadyWeeklyBoard
            dockVisible={props.dockVisible}
            online={online()}
            query={boardQuery}
            onRefresh={refreshBoard}
          />
        </Loading>
      </Errored>
    </>
  )
}

function ReadyWeeklyBoard(props: ReadyWeeklyBoardProps): JSX.Element {
  const boardState = createMemo(() => {
    return deriveWeeklyBoardState({
      expiration: props.query.data.week.expiration,
      online: props.online,
      pending: props.query.pending,
      source: props.query.source,
      isRefreshFailed: props.query.lastRefreshError != null,
    })
  })

  return (
    <AppLayout dockVisible={props.dockVisible} variant="board">
      <WeeklyBoard state={boardState()} weekly={props.query.data} onRefresh={props.onRefresh} />
    </AppLayout>
  )
}
