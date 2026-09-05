import { createMemo } from 'solid-js'
import { activateServiceWorker } from './activate-service-worker'
import { useRegisterSW } from 'virtual:pwa-register/solid'

type PwaNoticeState = {
  dismissible: boolean
}

export function createPwaController() {
  let registration: ServiceWorkerRegistration | undefined
  let reloading = false
  let outdatedUpdate: Promise<void> | undefined

  const reloadOnce = () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  }

  const {
    offlineReady: [_offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // Let the PWA helper register at the browser's initial load boundary
    // instead of competing with the first Briefing board request and paint.
    // Update-wall callbacks remain wired from the first render onward.
    immediate: false,
    onNeedReload: reloadOnce,
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
  const recoverOutdated = async () => {
    // The update wall can be reached before the deferred registration callback.
    const current = registration ?? (await navigator.serviceWorker?.getRegistration())
    try {
      await current?.update()
    } catch (error) {
      // Offline or a flaky update check: fall through to the reload anyway —
      // but leave a trace, since the reload may then land on the same wall.
      console.warn('[pwa] service worker update check failed before the wall reload', error)
    }

    const worker = current?.installing ?? current?.waiting
    if (worker) await activateServiceWorker(worker)
    // A successful update check can leave no new worker (or no registration).
    // Otherwise, only an activated worker may supply the next navigation.
    reloadOnce()
  }

  const reloadForOutdated = () => {
    outdatedUpdate ??= recoverOutdated()
      .catch((error) => {
        // A failed/stalled installation must not reload the old precached shell.
        // Leave the wall available for another explicit attempt.
        console.warn('[pwa] app update did not activate', error)
      })
      .finally(() => {
        outdatedUpdate = undefined
      })
    return outdatedUpdate
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
