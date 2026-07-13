import type { ChildrenReturn } from 'solid-js'
import { children, createEffect, createRenderEffect, createSignal, createUniqueId, Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { Portal } from '@solidjs/web'
import { css } from 'styled-system/css'

type TooltipProps = {
  label: string
  /** Horizontal panel placement relative to the trigger. Defaults to `center`. */
  align?: 'center' | 'start'
  /**
   * Visible hint that the trigger reveals a description. `underline` (default)
   * gives text triggers a dotted underline — the only cue a touch user gets,
   * since `cursor: help` is mouse-only. Container or glyph triggers that an
   * underline would garble (pills, boxes, icons) pass `none`.
   */
  affordance?: 'underline' | 'none'
  /**
   * Exactly one element. The tooltip attaches its trigger behavior to this
   * element directly — it keeps its own tag and styling, and no wrapper node is
   * introduced.
   */
  children: JSX.Element
}

// The panel renders through a `Portal` into `document.body`: inline is not an
// option because Safari clips `position: fixed` descendants of an ancestor that
// combines `overflow: hidden` with a stacking context (e.g. the board slabs).
const VIEWPORT_GAP = 8
const TRIGGER_GAP = 6

// Trigger affordances only — cursor and focus ring. Layout and shape stay on the
// child element itself, so a rounded chip keeps its pill and a plain line keeps
// its box.
const triggerClassNames = css({
  cursor: 'help',
  _focusVisible: {
    layerStyle: 'focusRing',
  },
})
  .split(' ')
  .filter(Boolean)

// The dotted-underline hint for text triggers, applied on top of the trigger's
// own classes so it only dresses the text and leaves layout and shape untouched.
// It is pointer-aware: touch devices, which cannot hover, keep it persistent —
// the only cue a tap user gets. Hover-capable (mouse) devices hide it at rest to
// keep the dense board calm and reveal it on hover or focus, where the tooltip
// is already discoverable.
const underlineClassNames = css({
  textDecorationLine: 'underline',
  textDecorationStyle: 'dotted',
  textDecorationColor: 'text.muted',
  textUnderlineOffset: '0.2em',
  _hoverCapable: {
    textDecorationLine: 'none',
    _hover: {
      textDecorationLine: 'underline',
      textDecorationColor: 'text.secondary',
    },
    _focusVisible: {
      textDecorationLine: 'underline',
      textDecorationColor: 'text.secondary',
    },
  },
})
  .split(' ')
  .filter(Boolean)

const panelStyles = css.raw({
  position: 'fixed',
  zIndex: 'overlay',
  maxWidth: 'content.tooltip',
  paddingBlock: '2',
  paddingInline: '3',
  borderWidth: '1px',
  borderStyle: 'solid',
  // The surface is already raised and carries `elevation.high` — a strong
  // border on top would double the depth cue.
  borderColor: 'border.subtle',
  borderRadius: 'md',
  background: 'surface.raised',
  boxShadow: 'elevation.high',
  color: 'text.secondary',
  textStyle: 'label',
  pointerEvents: 'none',
  // Entrance only — the panel is unmounted on close, so there is no exit
  // animation to run.
  animationStyle: 'tooltipIn',
})

export function Tooltip(props: TooltipProps): JSX.Element {
  const tooltipId = createUniqueId()

  const [open, setOpen] = createSignal(false)
  const [$panel, setPanel] = createSignal<HTMLDivElement>()

  const resolved = children(() => props.children)

  let $trigger: HTMLElement | undefined

  const close = (): void => {
    setOpen(false)
  }

  // Attach trigger behavior to the child element itself — no wrapper node — so
  // the child keeps its natural tag (no invalid markup) and stays a direct child
  // of its own grid/flex parent (no stray layout item). Children are static, so
  // this settles once on mount and sets `$trigger` before the panel can open.
  createRenderEffect(
    () => resolveTriggerElement(resolved),
    (trigger) => {
      $trigger = trigger
      trigger.classList.add(...triggerClassNames)
      if ((props.affordance ?? 'underline') === 'underline') trigger.classList.add(...underlineClassNames)
      trigger.setAttribute('tabindex', '0')
      return listenForTrigger(trigger, () => setOpen(true), close)
    },
  )

  // Associate the trigger with the panel by id only while it is shown.
  createEffect(
    () => open(),
    (isOpen) => {
      if ($trigger == null) return
      if (isOpen) $trigger.setAttribute('aria-describedby', tooltipId)
      else $trigger.removeAttribute('aria-describedby')
    },
  )

  // Position from a render effect: by the time the panel signal is set the
  // portalled node is already in the DOM, and applying coordinates synchronously
  // here lands them before paint — the panel never flashes unpositioned.
  // Include `props.label` to recompute on label changes.
  createRenderEffect(
    () => [$panel(), props.align ?? 'center', props.label] as const,
    ([panel, align]) => {
      if (panel == null || $trigger == null) return
      assignStyles(panel, computeStyles(panel, $trigger, { align }))
    },
  )

  // Global dismiss listeners are needed only while the tooltip is visible.
  createEffect(
    () => open(),
    (isOpen) => {
      if (!isOpen || $trigger == null) return
      return listenForDismiss($trigger, close)
    },
  )

  return (
    <>
      {resolved()}
      <Show when={open()}>
        <Portal>
          <div ref={setPanel} id={tooltipId} role="tooltip" class={css(panelStyles)}>
            {props.label}
          </div>
        </Portal>
      </Show>
    </>
  )
}

function resolveTriggerElement(resolved: ChildrenReturn): HTMLElement {
  const [node, ...rest] = resolved.toArray()

  if (rest.length > 0 || !(node instanceof HTMLElement)) {
    throw new Error('Tooltip expects exactly one element child to attach its trigger behavior to.')
  }

  return node
}

// Native listeners on the child, mirroring the former delegated handlers: focus
// and mouse hover open/close; a touch tap opens (closing then happens via an
// outside tap or Escape). Non-mouse pointers are ignored so taps do not
// double-fire with the click affordance.
function listenForTrigger(trigger: HTMLElement, open: () => void, close: () => void): () => void {
  const handleFocusIn = (): void => open()
  const handleFocusOut = (): void => close()
  const handlePointerEnter = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') open()
  }
  const handlePointerLeave = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') close()
  }
  const handleClick = (): void => {
    if (isTouchOnly()) open()
  }

  trigger.addEventListener('focusin', handleFocusIn)
  trigger.addEventListener('focusout', handleFocusOut)
  trigger.addEventListener('pointerenter', handlePointerEnter)
  trigger.addEventListener('pointerleave', handlePointerLeave)
  trigger.addEventListener('click', handleClick)

  return () => {
    trigger.removeEventListener('focusin', handleFocusIn)
    trigger.removeEventListener('focusout', handleFocusOut)
    trigger.removeEventListener('pointerenter', handlePointerEnter)
    trigger.removeEventListener('pointerleave', handlePointerLeave)
    trigger.removeEventListener('click', handleClick)
  }
}

function computeStyles(
  $panel: HTMLElement,
  $trigger: HTMLElement,
  opts: { align: 'center' | 'start' },
): Partial<CSSStyleDeclaration> {
  const { align } = opts

  const triggerRect = $trigger.getBoundingClientRect()
  const panelRect = $panel.getBoundingClientRect()

  const preferredLeft =
    align === 'start' ? triggerRect.left : triggerRect.left + triggerRect.width / 2 - panelRect.width / 2
  const maxLeft = window.innerWidth - panelRect.width - VIEWPORT_GAP
  const left = Math.min(Math.max(preferredLeft, VIEWPORT_GAP), maxLeft)

  const above = triggerRect.top - panelRect.height - TRIGGER_GAP
  const top = above >= VIEWPORT_GAP ? above : triggerRect.bottom + TRIGGER_GAP

  return {
    left: `${left}px`,
    top: `${top}px`,
  }
}

function assignStyles($panel: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign($panel.style, styles)
}

// Close on Escape, on pointer down outside the trigger, and on any scroll or
// resize (the panel does not track the trigger after opening).
function listenForDismiss(trigger: HTMLElement, close: () => void): () => void {
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close()
  }
  const handlePointerDown = (event: PointerEvent): void => {
    if (event.target instanceof Node && !trigger.contains(event.target)) close()
  }

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('pointerdown', handlePointerDown)
  window.addEventListener('scroll', close, { capture: true, passive: true })
  window.addEventListener('resize', close)

  return () => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('pointerdown', handlePointerDown)
    window.removeEventListener('scroll', close, { capture: true })
    window.removeEventListener('resize', close)
  }
}

// One-shot check instead of a reactive media query: clicks are rare, a
// per-instance matchMedia subscription is not worth it.
function isTouchOnly(): boolean {
  return window.matchMedia('(hover: none)').matches
}
