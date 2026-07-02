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
 * The collision point is re-derived from layout every frame, so reflows
 * (fonts, resize) never leave a stale distance behind.
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
      const pinBleed = measurePinBleed($el.firstElementChild)
      let lastProgress = ''
      let lastChrome = ''

      const write = () => {
        frame = null
        const scrollY = window.scrollY
        // The host is in normal flow, so this sum is the scroll position
        // at which the bar's flow top meets the viewport top — constant
        // regardless of the current scroll or stuck state. The actual pin
        // lands pinBleed earlier.
        const stickDistance = $el.getBoundingClientRect().top + scrollY - pinBleed
        const progress = String(computeWindowProgress(scrollY, stickDistance, SHRINK_RANGE_PX))
        const chrome = String(computeWindowProgress(scrollY, stickDistance - CHROME_LEAD_PX, CHROME_LEAD_PX))
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
        frame ??= requestAnimationFrame(write)
      }

      // Land on the right size immediately: reload mid-scroll restores the
      // scroll position before any scroll event fires.
      write()
      window.addEventListener('scroll', scheduleWrite, { passive: true })

      return () => {
        window.removeEventListener('scroll', scheduleWrite)
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
