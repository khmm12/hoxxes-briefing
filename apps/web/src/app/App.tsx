import { createEffect, Errored, Loading, lazy, Show } from 'solid-js'
import type { I18n } from '@lingui/core'
import { Route, Router } from '@solidjs/router'
import type { JSX } from '@solidjs/web'
import { AppCrashScreen } from '~/app/AppCrashScreen'
import { I18nProvider } from '~/app/providers'
import { createPwaNoticeState } from '~/app/pwa'
import { BriefingPage } from '~/pages/briefing'
import { createOnlineStatus } from '~/shared/lib/create-online-status'
import { PwaNotice } from '~/widgets/pwa-notice'
import './styles.css'

const NotFoundPage = lazy(() => import('~/pages/not-found').then((module) => ({ default: module.NotFoundPage })))

// Dev-only state playground; the false branch is statically eliminated, so
// neither the route nor its chunk exists in production builds.
const PlaygroundPage = import.meta.env.DEV
  ? lazy(() => import('~/pages/briefing/dev').then((module) => ({ default: module.PlaygroundPage })))
  : null

type AppProps = {
  i18n: I18n
}

export function App(props: AppProps): JSX.Element {
  const online = createOnlineStatus()
  const pwaNotice = createPwaNoticeState()
  const pwaDockVisible = (): boolean => online() && pwaNotice.notice() != null

  return (
    <I18nProvider i18n={props.i18n}>
      <Errored
        fallback={(error) => {
          createEffect(error, (value) => console.error('AppErrorBoundary', value))

          // A runtime crash is never a normal state for this app, so no
          // soft-reset ceremony: recover with a real reload — through the
          // waiting service worker when an update is available, so a crash
          // fixed by a fresh deploy is actually recoverable.
          const recover = (): void => {
            if (pwaNotice.notice() != null) void pwaNotice.reloadForUpdate()
            else window.location.reload()
          }

          return <AppCrashScreen dockVisible={pwaDockVisible()} onRecover={recover} />
        }}
      >
        <Router root={(props) => <Loading>{props.children}</Loading>}>
          <Route path="/" component={() => <BriefingPage dockVisible={pwaDockVisible()} />} />
          {PlaygroundPage != null ? <Route path="/__playground/:scenario?" component={PlaygroundPage} /> : null}
          <Route path="*404" component={() => <NotFoundPage dockVisible={pwaDockVisible()} />} />
        </Router>
      </Errored>

      <Show when={pwaDockVisible()}>
        <PwaNotice onReload={pwaNotice.reloadForUpdate} />
      </Show>
    </I18nProvider>
  )
}
