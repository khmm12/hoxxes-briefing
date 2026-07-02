import { Show } from 'solid-js'
import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import type { BriefingRequestError } from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import { AlertIcon, BriefingUnavailableIcon, OfflineIcon, RefreshIcon } from '~/shared/ui/icon'
import { AppLayout } from '~/shared/ui/layout'
import { Spinner } from '~/shared/ui/spinner'
import { StateScreen } from '~/shared/ui/state-screen'

type BriefingLoadingStateProps = {
  dockVisible: boolean
  online: boolean
}

// Request failures only; runtime faults rethrow to the app-level boundary.
type BriefingErrorStateProps = {
  dockVisible: boolean
  error: BriefingRequestError
  online: boolean
  onRetry: () => void
}

export function BriefingLoadingState(props: BriefingLoadingStateProps): JSX.Element {
  const i18n = useI18n()

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <StateScreen
        css={loadingScreenStyles}
        body={
          props.online
            ? i18n._(msg`Pulling the latest deep dives now.`)
            : i18n._(msg`Looking for deep dives on your device.`)
        }
        bodyTone="muted"
        busy
        eyebrow={i18n._(msg`Checking the briefing`)}
        indicator={<Spinner />}
        title={i18n._(msg`Mining Morkite`)}
      />
    </AppLayout>
  )
}

export function BriefingErrorState(props: BriefingErrorStateProps): JSX.Element {
  const i18n = useI18n()

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <Show
        when={props.online}
        fallback={
          <StateScreen
            body={i18n._(msg`This device is offline and has no saved briefing.`)}
            eyebrow={i18n._(msg`Offline cache miss`)}
            indicator={<OfflineIcon />}
            passiveStatus={i18n._(msg`Open Hoxxes Briefing while online once to keep it available offline.`)}
            title={i18n._(msg`No saved briefing`)}
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
          body={formatBriefingUnavailableBody(i18n, props.error)}
          eyebrow={i18n._(msg`Briefing unavailable`)}
          indicator={<BriefingUnavailableIcon />}
          title={i18n._(msg`Could not load the briefing`)}
          tone="primary"
        />
      </Show>
    </AppLayout>
  )
}

type BriefingOutdatedStateProps = {
  dockVisible: boolean
  onUpdateApp: () => void
}

// The update wall (ADR 0002): this bundle can no longer read the deployed
// contract — 410 CONTRACT_RETIRED or a payload from a newer revision. The
// fixed bundle is already live (SPA and API deploy atomically), so the only
// action is updating, never retrying.
export function BriefingOutdatedState(props: BriefingOutdatedStateProps): JSX.Element {
  const i18n = useI18n()

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <StateScreen
        action={
          <ActionControl component="button" leadingIcon={<RefreshIcon />} onClick={props.onUpdateApp} type="button">
            {i18n._(msg`Update app`)}
          </ActionControl>
        }
        body={i18n._(msg`This version of the app can no longer read the briefing. Update to keep diving.`)}
        eyebrow={i18n._(msg`Update required`)}
        indicator={<AlertIcon />}
        title={i18n._(msg`A new version is available`)}
        tone="primary"
      />
    </AppLayout>
  )
}

// Cached data usually lands within the delay — keep the loading screen
// invisible that long so it never flashes on a warm cache.
const loadingScreenStyles = css.raw({
  animationStyle: 'delayedFadeIn',
})

// A request can fail without the network being at fault (API error, bad
// payload) — do not blame the user's connection in that case.
function formatBriefingUnavailableBody(i18n: I18n, error: BriefingRequestError): string {
  if (error.kind === 'network') return i18n._(msg`Try again once the connection settles.`)

  return i18n._(msg`Mission Control is having trouble on its end. Try again in a moment.`)
}
