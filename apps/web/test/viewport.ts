import type { DetachedWindowAPI } from 'happy-dom'

// Breakpoint-sensitive tests arrange their layout by driving the real happy-dom
// viewport, not by faking matchMedia: happy-dom evaluates `(min-width: …)`,
// `(hover: …)`, and `(pointer: …)` against the actual window, so a real width
// gives create-media-query the same signal the browser would. The app is
// mobile-first, so `mobile` is the suite-wide default (see vitest.setup.ts);
// desktop suites opt up to `desktop` and reset back on teardown.
//
// Caveat: happy-dom updates `MediaQueryList.matches` live but does NOT dispatch
// a `change` event on resize, so a component that subscribed before the resize
// will not react to it. Set the viewport BEFORE rendering; drive reactive
// change paths with an explicit matchMedia fake instead.
export const VIEWPORT_WIDTH = {
  mobile: 375,
  desktop: 1024,
} as const

export function setViewportWidth(width: number): void {
  happyDOM().setViewport({ width })
}

function happyDOM(): DetachedWindowAPI {
  return (window as unknown as { happyDOM: DetachedWindowAPI }).happyDOM
}
