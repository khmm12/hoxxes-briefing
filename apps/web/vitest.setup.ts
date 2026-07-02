import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@solidjs/testing-library'
import { setViewportWidth, VIEWPORT_WIDTH } from '~test/viewport'

// @solidjs/testing-library only self-registers cleanup when `afterEach` is a
// global, which it is not here (vitest globals are off). Register it once so
// every rendered tree is unmounted between tests and document.body stays clean.
afterEach(cleanup)

// The app is mobile-first, so every suite starts at a mobile viewport unless it
// opts up. happy-dom evaluates matchMedia against the real window, so this is
// the single knob behind create-media-query: at 375px every `(min-width: …)`
// breakpoint is below threshold (base layout) while `(hover:/pointer:)` keep
// happy-dom's mouse defaults. happy-dom's native default is 1024px (desktop), so
// resetting per test is what keeps the mobile baseline deterministic.
beforeEach(() => {
  if (typeof window !== 'undefined' && 'happyDOM' in window) {
    setViewportWidth(VIEWPORT_WIDTH.mobile)
  }
})
