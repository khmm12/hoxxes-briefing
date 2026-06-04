import { createEffect, createSignal, createUniqueId, Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { resolveClass, type StylingProps } from '~/shared/ui/styling'

type TooltipProps = StylingProps & {
  label: string
  children: JSX.Element
}

// The panel renders inline with `position: fixed` instead of a portal:
// `Portal` from @solidjs/web 2.0.0-beta.14 crashes on mount ("parameter 1 is
// not of type 'Node'"). Fixed positioning relies on no ancestor creating a
// containing block (transform/filter/contain) — revisit if board containers
// gain transform animations or once Portal is fixed upstream.
const VIEWPORT_GAP = 8
const TRIGGER_GAP = 6

// One-shot check instead of a reactive media query: clicks are rare, a
// per-instance matchMedia subscription is not worth it.
function isTouchOnly(): boolean {
  return window.matchMedia('(hover: none)').matches
}

const triggerStyles = css.raw({
  display: 'block',
  cursor: 'help',
  borderRadius: 'ui8',
  _focusVisible: {
    layerStyle: 'focusRing',
  },
})

const panelStyles = css.raw({
  position: 'fixed',
  zIndex: 24,
  maxWidth: '[18rem]',
  paddingBlock: 'ui8',
  paddingInline: 'ui12',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border.strong',
  borderRadius: 'ui8',
  background: 'surface.raised',
  boxShadow: 'elevation.high',
  color: 'text.secondary',
  fontSize: '0.875rem',
  fontWeight: '500',
  lineHeight: '1.55',
  pointerEvents: 'none',
})

export function Tooltip(props: TooltipProps): JSX.Element {
  const tooltipId = createUniqueId()

  const [open, setOpen] = createSignal(false)
  const [position, setPosition] = createSignal<{ left: number; top: number } | null>(null)

  let triggerElement: HTMLSpanElement | undefined
  let panelElement: HTMLDivElement | undefined

  const close = (): void => {
    setOpen(false)
    setPosition(null)
  }

  createEffect(
    () => open(),
    (isOpen) => {
      if (!isOpen || triggerElement == null || panelElement == null) return

      const trigger = triggerElement.getBoundingClientRect()
      const panel = panelElement.getBoundingClientRect()
      const maxLeft = window.innerWidth - panel.width - VIEWPORT_GAP
      const left = Math.min(Math.max(trigger.left + trigger.width / 2 - panel.width / 2, VIEWPORT_GAP), maxLeft)
      const above = trigger.top - panel.height - TRIGGER_GAP
      const top = above >= VIEWPORT_GAP ? above : trigger.bottom + TRIGGER_GAP

      setPosition({ left, top })

      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') close()
      }
      const handlePointerDown = (event: PointerEvent): void => {
        if (triggerElement != null && event.target instanceof Node && !triggerElement.contains(event.target)) close()
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
    },
  )

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: ARIA tooltip pattern — the trigger is a focusable wrapper, not a button
    // biome-ignore lint/a11y/useKeyWithClickEvents: onClick is a touch-only affordance; keyboard users open via focus
    <span
      ref={triggerElement}
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
      <Show when={open()}>
        <div
          ref={panelElement}
          id={tooltipId}
          role="tooltip"
          class={css(panelStyles)}
          style={{
            left: `${position()?.left ?? 0}px`,
            top: `${position()?.top ?? 0}px`,
            visibility: position() == null ? 'hidden' : 'visible',
          }}
        >
          {props.label}
        </div>
      </Show>
    </span>
  )
}
