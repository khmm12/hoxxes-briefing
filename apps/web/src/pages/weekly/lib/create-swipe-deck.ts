import { type Accessor, createRenderEffect, createSignal } from 'solid-js'
import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel'
import { createMediaQuery } from '~/shared/lib/create-media-query'

type SwipeDeck<T> = {
  /** Item whose slide currently fills the deck viewport. */
  active: Accessor<T>
  /** Ref callback for the clipping viewport; receives the touch gesture. */
  attachViewport: (element: HTMLElement) => void
  /** Ref callback for the translated track; slides[i] must be track child i. */
  attachTrack: (element: HTMLElement) => void
  /** Mark the item active and glide its slide into place. */
  pick: (item: T) => void
}

type SwipeDeckOptions<T> = {
  /** Slide shown before any interaction; unknown values fall back to the first. */
  initial?: T
  /** Notified when the user activates a different slide (chip pick or settled swipe). */
  onActivate?: (item: T) => void
}

/**
 * Swipe deck backed by Embla Carousel.
 *
 * Why not native CSS scroll-snap: tried first and rejected on a real
 * iPhone — two defects, neither tunable. (1) Settle crawl: the snap's
 * asymptotic easing visibly creeps over its last pixels on any
 * high-contrast slide edge. (2) Axis capture: a fast vertical page flick
 * that starts on the horizontal lane gets eaten by it.
 *
 * Why a library over the hand-rolled pointer driver that lived here: the
 * unwinnable part is the race against native pan-y scrolling on iOS.
 * Axis-lock heuristics (dominance cone, decision radius) plus
 * preventDefault on touchmove still lost some gestures to the browser —
 * it would steal a locked horizontal drag (pointercancel) and the card
 * twitched back. Embla owns the touch stream end to end with
 * device-tuned thresholds; don't re-derive that machinery here.
 *
 * Swipe is touch/pen-only by design — cursor users switch via the chips
 * (watchDrag filters mouse drags, which would fight text selection in the
 * slabs). While `enabled` is false (wide layout shows all slides in a
 * grid) no instance exists and the track keeps no inline transform.
 */
export function createSwipeDeck<T extends string>(
  items: readonly [T, ...T[]],
  enabled: Accessor<boolean>,
  options: SwipeDeckOptions<NoInfer<T>> = {},
): SwipeDeck<T> {
  // An unknown initial item (stale persisted value) falls back to the first.
  const [activeIndex, setActiveIndex] = createSignal(
    options.initial == null ? 0 : Math.max(0, items.indexOf(options.initial)),
  )
  const prefersReducedMotion = createMediaQuery('(prefers-reduced-motion: reduce)')

  // Refs are signals so the embla effect re-runs once they mount.
  const [$viewport, setViewport] = createSignal<HTMLElement>()
  const [$track, setTrack] = createSignal<HTMLElement>()
  let embla: EmblaCarouselType | null = null

  const active = () => items[activeIndex()] ?? items[0]

  const pick = (item: T) => {
    const index = items.indexOf(item)
    if (index < 0) return
    activate(index)
    // Reduced motion jumps instead of gliding. Drag settles are exempt:
    // they continue the user's own movement, embla keeps them physical.
    embla?.scrollTo(index, prefersReducedMotion())
  }

  // User-driven activation (vs the initial seed): notifies the consumer,
  // and only on an actual change.
  const activate = (index: number) => {
    if (index !== activeIndex()) options.onActivate?.(items[index] ?? items[0])
    setActiveIndex(index)
  }

  createRenderEffect(
    () => ({ on: enabled(), $root: $viewport(), $container: $track() }),
    ({ on, $root, $container }) => {
      if (!on || $root == null || $container == null) return

      const instance = EmblaCarousel($root, {
        container: $container,
        align: 'start',
        duration: SETTLE_DURATION,
        startIndex: activeIndex(),
        watchDrag: (_, event) => !(event instanceof MouseEvent),
      })
      // Fires on drag settles and programmatic scrolls alike; activate()
      // de-duplicates the pick() round-trip.
      instance.on('select', () => activate(instance.selectedScrollSnap()))
      // The `duration` option only paces programmatic scrolls; the
      // drag-release pace is hardcoded (25, sped up by flick force) with no
      // option. Cap it right after embla's own pointerUp computation —
      // min() keeps hard flicks snappier than slow releases.
      instance.on('pointerUp', () => {
        const { scrollBody } = instance.internalEngine()
        scrollBody.useDuration(Math.min(scrollBody.duration(), SETTLE_DURATION))
      })
      embla = instance

      return () => {
        embla = null
        // destroy() strips embla's inline styles; the wide grid lays out untouched.
        instance.destroy()
      }
    },
  )

  return { active, attachViewport: setViewport, attachTrack: setTrack, pick }
}

// Settle pace in embla's pseudo-physics units (not ms; lower = faster).
// The default 25 lands around 500–600ms and reads sluggish next to the
// 260ms cubic-out the hand-rolled deck had; 18 sits near 350ms. Applied to
// chip glides (`duration`) and as a cap on drag releases (pointerUp hook).
const SETTLE_DURATION = 18
