import { createEffect, Errored, Loading, lazy, Show } from 'solid-js'
import type { I18n } from '@lingui/core'
import { Route, Router } from '@solidjs/router'
import type { JSX } from '@solidjs/web'
import { createPwaController } from '~/app/pwa'
import { AppCrashScreen } from '~/app/shell/AppCrashScreen'
import { BriefingPage } from '~/pages/briefing'
import { I18nProvider } from '~/shared/i18n'
import { createOnlineStatus } from '~/shared/lib/create-online-status'
import { PwaNotice } from '~/widgets/pwa-notice'
import '../styles/global.css'

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
  const pwa = createPwaController()
  const pwaDockVisible = (): boolean => online() && pwa.notice() != null

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
            if (pwa.notice() != null) void pwa.reloadForUpdate()
            else window.location.reload()
          }

          return <AppCrashScreen dockVisible={pwaDockVisible()} onRecover={recover} />
        }}
      >
        <Router root={(props) => <Loading>{props.children}</Loading>}>
          <Route
            path="/"
            component={() => (
              <BriefingPage dockVisible={pwaDockVisible()} onUpdateApp={() => void pwa.reloadForOutdated()} />
            )}
          />
          {PlaygroundPage != null ? <Route path="/__playground/:scenario?" component={PlaygroundPage} /> : null}
          <Route path="*404" component={() => <NotFoundPage dockVisible={pwaDockVisible()} />} />
        </Router>
      </Errored>

      <Show when={pwaDockVisible()}>
        <PwaNotice onReload={pwa.reloadForUpdate} />
      </Show>
    </I18nProvider>
  )
}
