import { createMemo } from 'solid-js'
import { useRegisterSW } from 'virtual:pwa-register/solid'

type PwaNoticeState = {
  dismissible: boolean
}

export function createPwaNoticeState() {
  const {
    offlineReady: [_offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const notice = createMemo<PwaNoticeState | null>(() => (needRefresh() ? { dismissible: true } : null))

  const reloadForUpdate = async () => {
    await updateServiceWorker(true)
  }

  const dismissInstallHint = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return {
    dismissInstallHint,
    notice,
    reloadForUpdate,
  }
}
