import { createSubscription } from './create-subscription'

export function createOnlineStatus() {
  return createSubscription({
    getCurrentValue: () => (typeof navigator === 'undefined' ? true : navigator.onLine),
    deps: () => [] as const,
    subscribe(fn) {
      if (typeof window === 'undefined') return () => {}

      window.addEventListener('online', fn)
      window.addEventListener('offline', fn)

      return () => {
        window.removeEventListener('online', fn)
        window.removeEventListener('offline', fn)
      }
    },
  })
}
