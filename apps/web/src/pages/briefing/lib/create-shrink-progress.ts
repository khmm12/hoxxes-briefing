import { type Accessor, createRenderEffect } from 'solid-js'

type ShrinkProgressArgs = {
  /**
   * Stable flow anchor whose top edge anchors the shrinking bar's pin
   * point (offset by the bar's measured margin bleed); the progress
   * variables are written here and inherit down. Must sit above the bar's
   * own reflow (the bar is its first child), so the bar shrinking can
   * never feed back into the measurement.
   */
  $host: Accessor<HTMLElement | undefined>
  /** Gate: run only while the shrink UI is on screen (stacked deck). */
  active: Accessor<boolean>
}

// The bar compresses over this many px of scrolling once pinned.
const SHRINK_RANGE_PX = 48
// The backdrop's fade-in window: the last px of travel before the bar pins.
// Completing exactly at the pin keeps the invariant that the backdrop is
// opaque before any content can reach the bar.
const CHROME_LEAD_PX = 24

/**
 * Writes two scroll-linked variables onto the host as the page scrolls:
 *
 * - `--shrink-progress` (0 full-size → 1 compact) drives the bar's
 *   geometry. iOS large-title collapse: the bar travels at full size and
 *   compresses only once it collides with the viewport top, over the
 *   first SHRINK_RANGE_PX of pinned scrolling.
 * - `--shrink-chrome` (0 → 1) drives the opaque backdrop. It completes
 *   on the final approach to the pin, so content never slides under a
 *   still-transparent bar.
 *
 * The collision point is measured once and cached for scroll frames. Layout
 * invalidation (activation, resize, or font completion) schedules one fresh
 * measurement before the next write. Keeping the geometry read out of the
 * scroll path avoids a read-after-write layout loop while preserving the
 * sticky collision point after a reflow.
 */
export function createShrinkProgress(args: ShrinkProgressArgs): void {
  let frame: number | null = null

  createRenderEffect(
    () => ({ on: args.active(), $el: args.$host() }),
    ({ on, $el }) => {
      if ($el == null) return
      if (!on) {
        $el.style.removeProperty('--shrink-progress')
        $el.style.removeProperty('--shrink-chrome')
        return
      }

      // The bar's breathing bleeds out of its flow slot (negative block
      // margin), so its border box pins above the host's top edge. Measured
      // from the live style rather than hardcoded: the CSS value is a
      // rem-based token that can be retuned — or rescaled by a non-default
      // root font size — without this file knowing.
      let stickDistance: number | null = null
      let measurementPending = true
      let lastProgress = ''
      let lastChrome = ''
      let disposed = false

      const measure = (): void => {
        // Read all geometry before the scroll-linked CSS variables are written
        // for this frame. The child margin is the only bar geometry that can
        // move the pin independently of the host's flow position.
        const pinBleed = measurePinBleed($el.firstElementChild)
        stickDistance = $el.getBoundingClientRect().top + window.scrollY - pinBleed
        measurementPending = false
      }

      const write = (): void => {
        frame = null
        // A restored scroll position can arrive before the deferred activation
        // frame. Pay the one unavoidable read there; every later scroll frame
        // uses the cached distance.
        if (measurementPending || stickDistance === null) measure()

        const scrollY = window.scrollY
        const distance = stickDistance
        if (distance === null) return
        const progress = String(computeWindowProgress(scrollY, distance, SHRINK_RANGE_PX))
        const chrome = String(computeWindowProgress(scrollY, distance - CHROME_LEAD_PX, CHROME_LEAD_PX))
        // Skip same-value writes: outside the windows both values sit
        // clamped at 0/1, and rewriting them would dirty the inline style
        // (and recalc the consuming subtree) on every momentum frame.
        if (progress !== lastProgress) {
          lastProgress = progress
          $el.style.setProperty('--shrink-progress', progress)
        }
        if (chrome !== lastChrome) {
          lastChrome = chrome
          $el.style.setProperty('--shrink-chrome', chrome)
        }
      }

      const scheduleWrite = (): void => {
        if (disposed) return
        frame ??= requestAnimationFrame(write)
      }

      const scheduleMeasurement = (): void => {
        if (disposed) return
        measurementPending = true
        scheduleWrite()
      }

      const onFontLayout = (): void => {
        scheduleMeasurement()
      }

      // Defer the initial read until the browser has had a chance to settle
      // the first board layout. `write` still lands on the right size for a
      // reload restored at a non-zero scroll position.
      scheduleMeasurement()
      window.addEventListener('scroll', scheduleWrite, { passive: true })
      window.addEventListener('resize', scheduleMeasurement, { passive: true })

      // Do not observe the host with ResizeObserver: its own progress-driven
      // padding and the switch's shrinking box are part of the observed
      // subtree, so the observer would turn our writes back into measurements.
      // Viewport resize plus the font-settle signals below cover the external
      // layout changes this collision distance can receive without that loop.

      // Font metrics can change after the first stylesheet pass. `ready` is
      // available in Chromium/Safari; `loadingdone` also catches a later face
      // that was not part of the initial document.fonts set.
      const fonts = document.fonts
      fonts?.addEventListener?.('loadingdone', onFontLayout)
      void fonts?.ready.then(onFontLayout)

      return () => {
        disposed = true
        window.removeEventListener('scroll', scheduleWrite)
        window.removeEventListener('resize', scheduleMeasurement)
        fonts?.removeEventListener?.('loadingdone', onFontLayout)
        if (frame != null) cancelAnimationFrame(frame)
        frame = null
      }
    },
  )
}

/**
 * Linear 0→1 as scrollY crosses [start, start + range]; clamped outside,
 * which also absorbs iOS rubber-band overscroll (negative scrollY).
 */
export function computeWindowProgress(scrollY: number, start: number, range: number): number {
  return Math.min(1, Math.max(0, (scrollY - start) / range))
}

/** How far the bar's border box bleeds above its flow slot, in px. */
function measurePinBleed($bar: Element | null): number {
  if ($bar == null) return 0
  const margin = Number.parseFloat(getComputedStyle($bar).marginBlockStart)
  return Number.isFinite(margin) ? Math.max(0, -margin) : 0
}
