import { createMemo } from 'solid-js'
import { useRegisterSW } from 'virtual:pwa-register/solid'

type PwaNoticeState = {
  dismissible: boolean
}

export function createPwaController() {
  let registration: ServiceWorkerRegistration | undefined

  const {
    offlineReady: [_offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, swRegistration) {
      registration = swRegistration
    },
  })

  const notice = createMemo<PwaNoticeState | null>(() => (needRefresh() ? { dismissible: true } : null))

  const reloadForUpdate = async () => {
    await updateServiceWorker(true)
  }

  // Update-wall recovery (410 CONTRACT_RETIRED): the fixed bundle is already
  // deployed, but the installed service worker may not have discovered it yet
  // — a plain reload would just re-serve the stale precached shell. Pull the
  // fresh worker first, then go through the normal update reload.
  const reloadForOutdated = async () => {
    try {
      await registration?.update()
    } catch (error) {
      // Offline or a flaky update check: fall through to the reload anyway —
      // but leave a trace, since the reload may then land on the same wall.
      console.warn('[pwa] service worker update check failed before the wall reload', error)
    }

    await updateServiceWorker(true)
    // updateServiceWorker resolves without reloading when no update is
    // waiting; the wall must always end in a reload.
    window.location.reload()
  }

  const dismissInstallHint = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return {
    dismissInstallHint,
    notice,
    reloadForOutdated,
    reloadForUpdate,
  }
}
