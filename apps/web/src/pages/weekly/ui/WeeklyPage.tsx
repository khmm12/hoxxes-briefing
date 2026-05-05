import { type Accessor, createMemo, createSignal, Errored, Loading, onCleanup, Show } from 'solid-js'
import { msg } from '@lingui/core/macro'
import { Meta, Title } from '@solidjs/meta'
import type { JSX } from '@solidjs/web'
import { useI18n } from '~/shared/i18n'
import { createOnlineStatus } from '~/shared/lib/create-online-status'
import { AppLayout } from '~/shared/ui/layout'
import { createWeeklyBoardQuery } from '../model/create-weekly-board-query'
import { isWeeklyExpired, type WeeklyBoardViewState } from '../model/weekly-page-state'
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
      <Title>{i18n._(msg`Hoxxes Briefing | DRG Deep Dive Board`)}</Title>
      <Meta
        name="description"
        content={i18n._(
          msg`Check the current Deep Rock Galactic Deep Dive and Elite Deep Dive board with weekly stages, objectives, hazards, mutators, and reset timing.`,
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
  const now = createWallClock()

  const expiration = createMemo(() => new Date(props.query.data.week.expiration))
  const expired = createMemo(() => isWeeklyExpired(expiration(), now()))

  const boardState = {
    get expired() {
      return expired()
    },
    get source() {
      return props.query.source
    },
    get online() {
      return props.online
    },
    get refreshing() {
      return props.query.pending
    },
    get refreshFailed() {
      return props.query.lastRefreshError != null
    },
  } satisfies WeeklyBoardViewState

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <WeeklyBoard now={now()} state={boardState} data={props.query.data} onRefresh={props.onRefresh} />
    </AppLayout>
  )
}

function createWallClock(): Accessor<Date> {
  const [now, setNow] = createSignal(new Date())
  const intervalID = globalThis.setInterval(() => setNow(new Date()), 1_000)

  onCleanup(() => globalThis.clearInterval(intervalID))

  return now
}
