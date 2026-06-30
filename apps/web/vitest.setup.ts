import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@solidjs/testing-library'

// @solidjs/testing-library only self-registers cleanup when `afterEach` is a
// global, which it is not here (vitest globals are off). Register it once so
// every rendered tree is unmounted between tests and document.body stays clean.
afterEach(cleanup)

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
