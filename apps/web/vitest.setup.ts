import '@testing-library/jest-dom/vitest'

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
