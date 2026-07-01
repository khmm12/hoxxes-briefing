import { type Accessor, createEffect, createMemo, createSignal, Errored, Loading, merge, onSettled } from 'solid-js'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { BriefingRequestError } from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { createOnlineStatus } from '~/shared/lib/create-online-status'
import { Meta, Title } from '~/shared/lib/document-head'
import { AppLayout } from '~/shared/ui/layout'
import { createBoardQuery } from '../model/create-board-query'
import { type BoardViewState, isWeeklyExpired } from '../model/weekly-page-state'
import { Board } from './Board'
import { WeeklyErrorState, WeeklyLoadingState } from './WeeklyPageStates'

type BoardQuery = ReturnType<typeof createBoardQuery>

type WeeklyPageProps = {
  dockVisible: boolean
}

type ReadyBoardProps = {
  dockVisible: boolean
  online: boolean
  query: BoardQuery
  onRefresh: () => void
}

export function WeeklyPage(props: WeeklyPageProps): JSX.Element {
  const i18n = useI18n()
  const online = createOnlineStatus()
  const boardQuery = createBoardQuery()
  const [retryVersion, setRetryVersion] = createSignal(0)

  const handleRefresh = (): void => {
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

      <Loading on={retryVersion()} fallback={<WeeklyLoadingState dockVisible={props.dockVisible} online={online()} />}>
        <Errored
          fallback={(error, reset) => {
            createEffect(error, (v) => console.error('ErrorBoundary', v))

            const handleRetry = () => {
              setRetryVersion((v) => v + 1)
              reset()
            }

            // The check lives in a tracked child expression, not in the
            // fallback closure: `error` is an accessor and may swap in place
            // without the closure re-running. This boundary owns request
            // failures only; anything else rethrows to the app-level boundary.
            return (
              <>
                {(() => {
                  const requestError = error()
                  if (!(requestError instanceof BriefingRequestError)) throw requestError

                  return (
                    <WeeklyErrorState
                      dockVisible={props.dockVisible}
                      error={requestError}
                      online={online()}
                      onRetry={handleRetry}
                    />
                  )
                })()}
              </>
            )
          }}
        >
          <ReadyBoard dockVisible={props.dockVisible} online={online()} query={boardQuery} onRefresh={handleRefresh} />
        </Errored>
      </Loading>
    </>
  )
}

function ReadyBoard(props: ReadyBoardProps): JSX.Element {
  const now = createWallClock()

  const state = createState(
    merge(props, {
      get now() {
        return now()
      },
    }),
  )

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <Board now={now()} state={state} data={props.query.data} onRefresh={props.onRefresh} />
    </AppLayout>
  )
}

function createState(props: ReadyBoardProps & { now: Date }): BoardViewState {
  const expiration = createMemo(() => new Date(props.query.data.expiration), {
    equals: (a, b) => a instanceof Date && b instanceof Date && a.getTime() === b.getTime(),
  })

  const expired = createMemo(() => isWeeklyExpired(expiration(), props.now))

  return {
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
  }
}

function createWallClock(): Accessor<Date> {
  const [now, setNow] = createSignal(new Date())

  onSettled(() => {
    const intervalID = globalThis.setInterval(() => setNow(new Date()), 1_000)
    return () => globalThis.clearInterval(intervalID)
  })

  return now
}
