import { createEffect, createRenderEffect, createSignal, createUniqueId, Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { Portal } from '@solidjs/web'
import { css } from 'styled-system/css'
import { resolveClass, type StylingProps } from '~/shared/ui/styling'

type TooltipProps = StylingProps & {
  label: string
  /** Horizontal panel placement relative to the trigger. Defaults to `center`. */
  align?: 'center' | 'start'
  children: JSX.Element
}

// The panel renders through a `Portal` into `document.body`: inline is not an
// option because Safari clips `position: fixed` descendants of an ancestor that
// combines `overflow: hidden` with a stacking context (e.g. the board slabs).
const VIEWPORT_GAP = 8
const TRIGGER_GAP = 6

const triggerStyles = css.raw({
  display: 'block',
  cursor: 'help',
  borderRadius: 'md',
  _focusVisible: {
    layerStyle: 'focusRing',
  },
})

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
})

export function Tooltip(props: TooltipProps): JSX.Element {
  const tooltipId = createUniqueId()

  const [open, setOpen] = createSignal(false)
  const [$panel, setPanel] = createSignal<HTMLDivElement>()

  let $trigger: HTMLSpanElement | undefined

  const close = (): void => {
    setOpen(false)
  }

  // Position from a render effect: by the time
  // the panel signal is set the portalled node is already in the DOM,
  // and applying coordinates synchronously here lands them
  // before paint — the panel never flashes unpositioned.
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
      {/* biome-ignore lint/a11y/noStaticElementInteractions: ARIA tooltip pattern — the trigger is a focusable wrapper, not a button */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: onClick is a touch-only affordance; keyboard users open via focus */}
      <span
        ref={$trigger}
        aria-describedby={open() ? tooltipId : undefined}
        class={resolveClass(props.class, props.css, triggerStyles)}
        tabindex="0"
        onClick={() => {
          // Touch taps may not focus a tabbable span on every platform; make
          // sure a tap always opens. Closing happens via outside tap or Escape.
          if (isTouchOnly()) setOpen(true)
        }}
        onFocusIn={() => setOpen(true)}
        onFocusOut={close}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setOpen(true)
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') close()
        }}
      >
        {props.children}
      </span>
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
