const activationTimeoutMs = 15_000

/** Wait through installation and activation before navigating to the new shell. */
export function activateServiceWorker(worker: ServiceWorker): Promise<void> {
  return new Promise((resolve, reject) => {
    let skipWaitingSent = false
    const timeout = setTimeout(() => finish(new Error('Service worker activation timed out')), activationTimeoutMs)

    function finish(error?: Error) {
      clearTimeout(timeout)
      worker.removeEventListener('statechange', advance)
      if (error) reject(error)
      else resolve()
    }

    function advance() {
      if (worker.state === 'activated') finish()
      else if (worker.state === 'redundant') finish(new Error('Service worker installation failed'))
      else if (worker.state === 'installed' && !skipWaitingSent) {
        skipWaitingSent = true
        try {
          worker.postMessage({ type: 'SKIP_WAITING' })
        } catch (error) {
          finish(new Error('Could not activate the installed service worker', { cause: error }))
        }
      }
    }

    worker.addEventListener('statechange', advance)
    advance()
  })
}
