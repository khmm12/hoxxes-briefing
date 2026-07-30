import { createEffect, Errored, Loading, Show } from 'solid-js'
import type { I18n } from '@lingui/core'
import type { JSX } from '@solidjs/web'
import { createPwaController } from '~/app/pwa'
import { I18nProvider } from '~/shared/i18n'
import { createOnlineStatus } from '~/shared/lib/create-online-status'
import { AppLayout } from '~/shared/ui/layout'
import { PwaNotice } from '~/widgets/pwa-notice'
import { AppCrashScreen } from './AppCrashScreen'
import { AppRouter } from './router'
import '../styles/global.css'

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

          return <AppCrashScreen onRecover={recover} />
        }}
      >
        <AppRouter onUpdateApp={() => void pwa.reloadForOutdated()}>
          {(routerProps) => (
            <AppLayout>
              <Loading>{routerProps.children}</Loading>
            </AppLayout>
          )}
        </AppRouter>
      </Errored>

      <Show when={pwaDockVisible()}>
        <PwaNotice onReload={pwa.reloadForUpdate} />
      </Show>
    </I18nProvider>
  )
}
