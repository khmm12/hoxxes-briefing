import { Show } from 'solid-js'
import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { WeeklyRequestError } from '~/shared/api/weekly'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import { AlertIcon, EmptyBoardIcon, OfflineIcon, RefreshIcon } from '~/shared/ui/icon'
import { AppLayout } from '~/shared/ui/layout'
import { Spinner } from '~/shared/ui/spinner'
import { StateScreen } from '~/shared/ui/state-screen'

type WeeklyLoadingStateProps = {
  dockVisible: boolean
  online: boolean
}

type WeeklyErrorStateProps = {
  dockVisible: boolean
  error: unknown
  online: boolean
  onRetry: () => void
}

type EmptyWeeklyStateProps = {
  dockVisible: boolean
  error: WeeklyRequestError
  online: boolean
  onRetry: () => void
}

export function WeeklyLoadingState(props: WeeklyLoadingStateProps): JSX.Element {
  const i18n = useI18n()

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <StateScreen
        body={
          props.online
            ? i18n._(msg`Pulling the latest deep dives now.`)
            : i18n._(msg`Looking for deep dives on your device.`)
        }
        bodyTone="disabled"
        busy
        eyebrow={i18n._(msg`Checking this week`)}
        indicator={<Spinner />}
        title={i18n._(msg`Mining Morkite`)}
      />
    </AppLayout>
  )
}

export function WeeklyErrorState(props: WeeklyErrorStateProps): JSX.Element {
  return (
    <Show
      when={props.error instanceof WeeklyRequestError ? props.error : undefined}
      keyed
      fallback={<RuntimeErrorState dockVisible={props.dockVisible} />}
    >
      {(error) => (
        <EmptyWeeklyState dockVisible={props.dockVisible} error={error} online={props.online} onRetry={props.onRetry} />
      )}
    </Show>
  )
}

function EmptyWeeklyState(props: EmptyWeeklyStateProps): JSX.Element {
  const i18n = useI18n()

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <Show
        when={props.online}
        fallback={
          <StateScreen
            body={i18n._(msg`This device is offline and has no saved weekly board.`)}
            eyebrow={i18n._(msg`Offline cache miss`)}
            indicator={<OfflineIcon />}
            passiveStatus={i18n._(msg`Open Hoxxes Briefing while online once to keep a board available offline.`)}
            title={i18n._(msg`No saved board`)}
            tone="info"
          />
        }
      >
        <StateScreen
          action={
            <ActionControl component="button" leadingIcon={<RefreshIcon />} onClick={props.onRetry} type="button">
              {i18n._(msg`Try again`)}
            </ActionControl>
          }
          body={formatBoardUnavailableBody(i18n, props.error)}
          eyebrow={i18n._(msg`Board unavailable`)}
          indicator={<EmptyBoardIcon />}
          title={i18n._(msg`Could not load the weekly board`)}
          tone="warning"
        />
      </Show>
    </AppLayout>
  )
}

// A request can fail without the network being at fault (API error, bad
// payload) — do not blame the user's connection in that case.
function formatBoardUnavailableBody(i18n: I18n, error: WeeklyRequestError): string {
  if (error.kind === 'network') return i18n._(msg`Try again once the connection settles.`)

  return i18n._(msg`Mission Control is having trouble on its end. Try again in a moment.`)
}

function RuntimeErrorState(props: { dockVisible: boolean }): JSX.Element {
  const i18n = useI18n()

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <StateScreen
        action={
          // A full reload, not an error-boundary reset: a reset keeps module
          // state intact, so a persistent fault re-crashes instantly and the
          // button looks dead. Reload matches what the label promises. (Stale
          // deploys are not this button's job — SW updates go via PwaNotice.)
          <ActionControl component="button" tone="primary" type="button" onClick={() => window.location.reload()}>
            {i18n._(msg`Reload app`)}
          </ActionControl>
        }
        body={i18n._(msg`Reload the app and try again.`)}
        eyebrow={i18n._(msg`Runtime fault`)}
        indicator={<AlertIcon />}
        title={i18n._(msg`App crashed`)}
        tone="danger"
      />
    </AppLayout>
  )
}
