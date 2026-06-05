import { type Accessor, createEffect, createSignal } from 'solid-js'
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

type VelocitySample = { x: number; t: number }

/**
 * Transform-driven swipe deck. Replaces native scroll-snap, whose two mobile
 * defects are not tunable (proven on device via the swipe lab):
 *
 * - axis capture: with `touch-action: pan-y` on the viewport vertical pans
 *   stay fully native, and the deck only ever drives clearly-horizontal
 *   gestures (|dx| > |dy| past slop) — fast page flicks never get eaten;
 * - settle crawl: the glide is a fixed-duration compositor transition, so
 *   there is no asymptotic tail for the eye to catch on the slab border.
 *
 * Swipe is touch/pen-only by design — cursor users switch via the chips.
 * While `enabled` is false (wide layout shows all slides in a grid) gestures
 * are ignored and the track keeps no inline transform.
 */
export function createSwipeDeck<T extends string>(
  items: readonly [T, ...T[]],
  enabled: Accessor<boolean>,
): SwipeDeck<T> {
  const [activeIndex, setActiveIndex] = createSignal(0)
  const prefersReducedMotion = createMediaQuery('(prefers-reduced-motion: reduce)')
  // Refs are signals so the listener effect re-runs once they mount.
  const [$viewport, setViewport] = createSignal<HTMLElement>()
  const [$track, setTrack] = createSignal<HTMLElement>()
  // Logical track offset in px; the visual position can trail it mid-glide.
  let offset = 0
  // Distance between adjacent slide origins (slide width + track gap).
  let step = 1
  let pointerId: number | null = null
  let startX = 0
  let startY = 0
  let startOffset = 0
  // null = axis undecided; 'dead' = vertical gesture, the page owns it.
  let lock: 'horizontal' | 'dead' | null = null
  let samples: VelocitySample[] = []

  const active = () => items[activeIndex()] ?? items[0]

  const attachViewport = (element: HTMLElement) => {
    setViewport(element)
  }

  const attachTrack = (element: HTMLElement) => {
    setTrack(element)
  }

  // Instant write: finger-follow, grab freezes, reflow corrections.
  // Finger-follow is capped at 60Hz by iOS pointermove delivery; smoothing
  // it via transition retargeting was tried and trembles — WebKit restarts
  // each retargeted transition from a desynced value.
  const jumpTo = (value: number) => {
    const $el = $track()
    if ($el == null) return
    offset = value
    $el.style.transition = 'none'
    $el.style.transform = `translate3d(${value}px, 0, 0)`
  }

  // Compositor-driven glide: the settle animation. Runs at native refresh
  // (120Hz on ProMotion) — a rAF loop is capped at 60Hz there and stutters.
  const glideTo = (value: number) => {
    const $el = $track()
    if ($el == null) return
    offset = value
    $el.style.transition = `transform ${SLIDE_MS}ms ${SLIDE_EASING}`
    $el.style.transform = `translate3d(${value}px, 0, 0)`
  }

  const travelTo = (value: number) => {
    if (prefersReducedMotion()) {
      jumpTo(value)
    } else {
      glideTo(value)
    }
  }

  // Freeze any in-flight glide at its current visual position so a new
  // gesture picks the deck up mid-animation instead of teleporting it.
  const grab = () => {
    const $el = $track()
    if ($el == null) return
    const transform = getComputedStyle($el).transform
    jumpTo(transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41)
  }

  // Math.max guards a zero step (hidden/unlaid-out track): position math
  // dividing by it would otherwise poison offsets with NaN.
  const measure = () => {
    const $el = $track()
    if ($el == null) return
    const $slides = Array.from($el.children) as HTMLElement[]
    step = Math.max(1, $slides.length > 1 ? $slides[1].offsetLeft - $slides[0].offsetLeft : $el.offsetWidth)
  }

  const settle = (velocity: number) => {
    const index = resolveTargetIndex(-offset / step, velocity, items.length)
    setActiveIndex(index)
    travelTo(-index * step)
  }

  const pick = (item: T) => {
    const index = items.indexOf(item)
    // An active drag owns the deck; the finger wins over the chip.
    if (index < 0 || lock === 'horizontal') return
    setActiveIndex(index)
    if (enabled()) travelTo(-index * step)
  }

  const handlePointerDown = (event: PointerEvent) => {
    if (!enabled() || !event.isPrimary || event.pointerType === 'mouse') return
    grab()
    measure()
    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    startOffset = offset
    lock = null
    samples = [{ x: event.clientX, t: event.timeStamp }]
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId || lock === 'dead') return

    const dx = event.clientX - startX
    const dy = event.clientY - startY
    if (lock == null) {
      if (Math.abs(dx) < SLOP_PX && Math.abs(dy) < SLOP_PX) return
      if (Math.abs(dy) >= Math.abs(dx)) {
        lock = 'dead'
        return
      }
      lock = 'horizontal'
      const $el = $viewport()
      if ($el != null) {
        // Capture throws when the pointer is already gone (NotFoundError);
        // the drag works without it, so it must never abort the move.
        try {
          $el.setPointerCapture(event.pointerId)
        } catch {
          // Keep following the pointer uncaptured.
        }
        // Selection stays available for taps and long-presses; only an
        // actual drag must not select the slab text it sweeps across.
        $el.style.userSelect = 'none'
      }
    }

    const min = -(items.length - 1) * step
    const raw = startOffset + dx
    // Rubber-band past the first/last slide.
    jumpTo(raw > 0 ? raw * EDGE_RESISTANCE : raw < min ? min + (raw - min) * EDGE_RESISTANCE : raw)

    samples.push({ x: event.clientX, t: event.timeStamp })
    if (samples.length > VELOCITY_SAMPLES) samples.shift()
  }

  // `interrupted`: native scrolling claimed the gesture mid-drag (edge
  // swipe etc) — release velocity is meaningless there, settle in place.
  const endGesture = (event: PointerEvent, interrupted: boolean) => {
    if (event.pointerId !== pointerId) return
    pointerId = null
    const wasDragging = lock === 'horizontal'
    lock = null
    if (!wasDragging) return
    $viewport()?.style.removeProperty('user-select')
    settle(interrupted ? 0 : computeVelocity(samples, event.timeStamp))
  }

  const handlePointerUp = (event: PointerEvent) => {
    endGesture(event, false)
  }

  const handlePointerCancel = (event: PointerEvent) => {
    endGesture(event, true)
  }

  // A reflow moves the slide origins, so re-aim the track at the active one.
  const handleResize = () => {
    if (!enabled()) return
    measure()
    jumpTo(-activeIndex() * step)
  }

  createEffect($viewport, ($el) => {
    if ($el == null) return

    $el.addEventListener('pointerdown', handlePointerDown)
    $el.addEventListener('pointermove', handlePointerMove)
    $el.addEventListener('pointerup', handlePointerUp)
    $el.addEventListener('pointercancel', handlePointerCancel)
    window.addEventListener('resize', handleResize)

    return () => {
      $el.removeEventListener('pointerdown', handlePointerDown)
      $el.removeEventListener('pointermove', handlePointerMove)
      $el.removeEventListener('pointerup', handlePointerUp)
      $el.removeEventListener('pointercancel', handlePointerCancel)
      window.removeEventListener('resize', handleResize)
    }
  })

  // Entering the wide layout strips the inline transform so the grid lays
  // out untouched; returning to the deck re-aims at the active slide.
  createEffect(
    () => ({ on: enabled(), $el: $track() }),
    ({ on, $el }) => {
      if ($el == null) return
      if (!on) {
        pointerId = null
        lock = null
        $el.style.transition = ''
        $el.style.transform = ''
        $viewport()?.style.removeProperty('user-select')
        return
      }
      measure()
      jumpTo(-activeIndex() * step)
    },
  )

  return { active, attachViewport, attachTrack, pick }
}

// Movement below this is a tap, not a drag; past it the dominant axis wins.
const SLOP_PX = 6
// Release speed that advances a slide regardless of how far the drag got.
const FLICK_VELOCITY_PX_PER_MS = 0.3
// Fixed settle duration: cubic-out spends only its last ~15% below
// 1px/frame, versus the ~260ms asymptotic tail of native snap.
const SLIDE_MS = 260
// easeOutCubic.
const SLIDE_EASING = 'cubic-bezier(0.33, 1, 0.68, 1)'
const EDGE_RESISTANCE = 0.3
const VELOCITY_SAMPLES = 6
// Velocity reads the gesture's recent past, not its whole history.
const VELOCITY_WINDOW_MS = 100

/**
 * Flicks go one slide in the flick direction; slow releases settle to the
 * nearest slide. Finger moving left (negative velocity) advances forward.
 * `position` is the fractional slide index the track currently sits at.
 */
export function resolveTargetIndex(position: number, velocity: number, slideCount: number): number {
  const target =
    Math.abs(velocity) >= FLICK_VELOCITY_PX_PER_MS
      ? velocity < 0
        ? Math.ceil(position)
        : Math.floor(position)
      : Math.round(position)

  return Math.min(slideCount - 1, Math.max(0, target))
}

/** Pointer velocity in px/ms over the recent samples, signed. */
export function computeVelocity(samples: readonly VelocitySample[], now: number): number {
  const recent = samples.filter((sample) => now - sample.t <= VELOCITY_WINDOW_MS)
  const first = recent[0]
  const last = recent[recent.length - 1]
  if (first == null || last == null || first === last) return 0
  const elapsed = last.t - first.t
  return elapsed > 0 ? (last.x - first.x) / elapsed : 0
}
