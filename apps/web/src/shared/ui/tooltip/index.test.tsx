import { afterEach, describe, expect, it } from 'vitest'
import { flush } from 'solid-js'
import { fireEvent, render } from '@solidjs/testing-library'
import { Tooltip } from '~/shared/ui/tooltip'

// The panel renders through a `Portal` into `document.body`, outside the
// render container @solidjs/testing-library scopes its query helpers to —
// read it straight off the document instead of through `getByRole` etc.
function queryPanel(): HTMLElement | null {
  return document.body.querySelector('[role="tooltip"]')
}

function setPointerHover(isHover: boolean): void {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: query === '(hover: none)' ? !isHover : isHover,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

afterEach(() => {
  // Each case reassigns window.matchMedia to force a hover/touch device; restore
  // the mouse baseline so a later test in this file starts from hover-capable.
  setPointerHover(true)
})

describe('Tooltip', () => {
  it('stays closed until the trigger is interacted with', () => {
    render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))

    expect(queryPanel()).toBeNull()
  })

  it('attaches its behavior to the child element itself, with no wrapper node', () => {
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))
    const trigger = getByText('trigger')

    // The trigger is the very element passed as the child — not an injected
    // wrapper — carrying the tooltip's tabindex.
    expect(trigger.tagName).toBe('SPAN')
    expect(trigger).toHaveAttribute('tabindex', '0')
  })

  it('adds affordance classes to a text trigger by default, and none for affordance="none"', () => {
    const dressed = render(() => (
      <Tooltip label="Helpful">
        <span>dressed</span>
      </Tooltip>
    )).getByText('dressed')
    const bare = render(() => (
      <Tooltip affordance="none" label="Helpful">
        <span>bare</span>
      </Tooltip>
    )).getByText('bare')

    // Panda styles are not loaded here, so assert the observable DOM wiring: the
    // underline is extra classes layered on top of the shared trigger classes,
    // and affordance="none" leaves the trigger with exactly those. This checks
    // class wiring only — happy-dom applies no CSS and does not evaluate
    // `@media (hover: hover)`, so the pointer-aware reveal is verified in a real
    // browser, not here.
    const bareClasses = [...bare.classList]
    expect(bareClasses.every((className) => dressed.classList.contains(className))).toBe(true)
    expect(dressed.classList.length).toBeGreaterThan(bare.classList.length)
  })

  it('opens on trigger focus and shows the label', () => {
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))

    fireEvent.focusIn(getByText('trigger'))
    flush()

    expect(queryPanel()).toHaveTextContent('Helpful')
  })

  it('closes on trigger blur', () => {
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))
    const trigger = getByText('trigger')

    fireEvent.focusIn(trigger)
    flush()
    fireEvent.focusOut(trigger)
    flush()

    expect(queryPanel()).toBeNull()
  })

  it('opens and closes on mouse hover', () => {
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))
    const trigger = getByText('trigger')

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    flush()
    expect(queryPanel()).not.toBeNull()

    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' })
    flush()
    expect(queryPanel()).toBeNull()
  })

  it('ignores touch hover, since taps drive touch instead', () => {
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))
    const trigger = getByText('trigger')

    fireEvent.pointerEnter(trigger, { pointerType: 'touch' })
    flush()

    expect(queryPanel()).toBeNull()
  })

  it('opens on click only when the device is touch-only', () => {
    setPointerHover(false)
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))

    fireEvent.click(getByText('trigger'))
    flush()

    expect(queryPanel()).not.toBeNull()
  })

  it('ignores click on a hover-capable (mouse) device', () => {
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))

    fireEvent.click(getByText('trigger'))
    flush()

    expect(queryPanel()).toBeNull()
  })

  it('closes on Escape while open', () => {
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))

    fireEvent.focusIn(getByText('trigger'))
    flush()
    expect(queryPanel()).not.toBeNull()

    fireEvent.keyDown(document, { key: 'Escape' })
    flush()
    expect(queryPanel()).toBeNull()
  })

  it('closes on a pointer-down outside the trigger', () => {
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))

    fireEvent.focusIn(getByText('trigger'))
    flush()
    expect(queryPanel()).not.toBeNull()

    fireEvent.pointerDown(document.body)
    flush()
    expect(queryPanel()).toBeNull()
  })

  it('marks the trigger described-by the panel only while open', () => {
    const { getByText } = render(() => (
      <Tooltip label="Helpful">
        <span>trigger</span>
      </Tooltip>
    ))
    const trigger = getByText('trigger')

    expect(trigger).not.toHaveAttribute('aria-describedby')

    fireEvent.focusIn(trigger)
    flush()

    const panel = queryPanel()
    expect(trigger).toHaveAttribute('aria-describedby', panel?.id)
  })
})
