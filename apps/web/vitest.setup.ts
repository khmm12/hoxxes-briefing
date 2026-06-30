import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@solidjs/testing-library'

// @solidjs/testing-library only self-registers cleanup when `afterEach` is a
// global, which it is not here (vitest globals are off). Register it once so
// every rendered tree is unmounted between tests and document.body stays clean.
afterEach(cleanup)

// jsdom implements neither observer; Embla (the route deck carousel) constructs
// both on mount and crashes without them. No-op stubs are enough for unit tests —
// they never need to fire, only to exist. Tests that need observed callbacks can
// override these.
for (const name of ['IntersectionObserver', 'ResizeObserver'] as const) {
  if (typeof globalThis !== 'undefined' && globalThis[name] == null) {
    globalThis[name] = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): [] {
        return []
      }
    } as never
  }
}

// jsdom ships no matchMedia; create-media-query reads it at construction time.
// Default to "not matching" so breakpoint-reactive code has a deterministic
// baseline. Tests that need a specific match override window.matchMedia.
if (typeof window !== 'undefined' && window.matchMedia == null) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}
