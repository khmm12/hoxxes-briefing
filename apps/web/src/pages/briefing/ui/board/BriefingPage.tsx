import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  Errored,
  Loading,
  merge,
  onSettled,
  Show,
} from 'solid-js'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { BriefingRequestError } from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { createOnlineStatus } from '~/shared/lib/create-online-status'
import { Meta, Title } from '~/shared/lib/document-head'
import { type BriefingViewState, isBriefingExpired } from '../../model/briefing-page-state'
import { createBriefingQuery } from '../../model/create-briefing-query'
import { Board } from './Board'
import { BriefingErrorState, BriefingLoadingState, BriefingOutdatedState } from './BriefingPageStates'

type BriefingQuery = ReturnType<typeof createBriefingQuery>

type BriefingPageProps = {
  onUpdateApp: () => void
}

type ReadyBoardProps = {
  online: boolean
  query: BriefingQuery
  onRefresh: () => void
  onUpdateApp: () => void
}

export function BriefingPage(props: BriefingPageProps): JSX.Element {
  const i18n = useI18n()
  const online = createOnlineStatus()
  const briefingQuery = createBriefingQuery()
  const [retryVersion, setRetryVersion] = createSignal(0)

  const handleRefresh = (): void => {
    briefingQuery.refresh()
  }

  return (
    <>
      <Title>{i18n._(msg`Hoxxes Briefing | DRG Deep Dive Overview`)}</Title>
      <Meta
        name="description"
        content={i18n._(
          msg`Check the current Deep Rock Galactic Deep Dive and Elite Deep Dive with stages, objectives, mutators, and reset timing.`,
        )}
      />

      <Loading on={retryVersion()} fallback={<BriefingLoadingState online={online()} />}>
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

                  // Only an app update fixes an outdated contract — retrying
                  // would just hit the same wall.
                  if (requestError.kind === 'outdated') {
                    return <BriefingOutdatedState onUpdateApp={props.onUpdateApp} />
                  }

                  return <BriefingErrorState error={requestError} online={online()} onRetry={handleRetry} />
                })()}
              </>
            )
          }}
        >
          <ReadyBoard
            online={online()}
            query={briefingQuery}
            onRefresh={handleRefresh}
            onUpdateApp={props.onUpdateApp}
          />
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

  // A refresh rejected with `outdated` is not a transient failure: the cached
  // board may be correct-for-its-revision, but every next fetch hits the same
  // wall, so the wall replaces the board instead of a "refresh failed" hint.
  const outdated = () => {
    const refreshError = props.query.lastRefreshError
    return refreshError instanceof BriefingRequestError && refreshError.kind === 'outdated'
  }

  return (
    <Show when={!outdated()} fallback={<BriefingOutdatedState onUpdateApp={props.onUpdateApp} />}>
      <Board now={now()} state={state} data={props.query.data} onRefresh={props.onRefresh} />
    </Show>
  )
}

function createState(props: ReadyBoardProps & { now: Date }): BriefingViewState {
  const expiration = createMemo(() => new Date(props.query.data.expiration), {
    equals: (a, b) => a instanceof Date && b instanceof Date && a.getTime() === b.getTime(),
  })

  const expired = createMemo(() => isBriefingExpired(expiration(), props.now))

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
