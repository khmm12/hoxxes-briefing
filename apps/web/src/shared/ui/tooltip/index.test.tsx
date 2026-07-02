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
    render(() => <Tooltip label="Helpful">trigger</Tooltip>)

    expect(queryPanel()).toBeNull()
  })

  it('opens on trigger focus and shows the label', () => {
    const { getByText } = render(() => <Tooltip label="Helpful">trigger</Tooltip>)

    fireEvent.focusIn(getByText('trigger'))
    flush()

    expect(queryPanel()).toHaveTextContent('Helpful')
  })

  it('closes on trigger blur', () => {
    const { getByText } = render(() => <Tooltip label="Helpful">trigger</Tooltip>)
    const trigger = getByText('trigger')

    fireEvent.focusIn(trigger)
    flush()
    fireEvent.focusOut(trigger)
    flush()

    expect(queryPanel()).toBeNull()
  })

  it('opens and closes on mouse hover', () => {
    const { getByText } = render(() => <Tooltip label="Helpful">trigger</Tooltip>)
    const trigger = getByText('trigger')

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    flush()
    expect(queryPanel()).not.toBeNull()

    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' })
    flush()
    expect(queryPanel()).toBeNull()
  })

  it('ignores touch hover, since taps drive touch instead', () => {
    const { getByText } = render(() => <Tooltip label="Helpful">trigger</Tooltip>)
    const trigger = getByText('trigger')

    fireEvent.pointerEnter(trigger, { pointerType: 'touch' })
    flush()

    expect(queryPanel()).toBeNull()
  })

  it('opens on click only when the device is touch-only', () => {
    setPointerHover(false)
    const { getByText } = render(() => <Tooltip label="Helpful">trigger</Tooltip>)

    fireEvent.click(getByText('trigger'))
    flush()

    expect(queryPanel()).not.toBeNull()
  })

  it('ignores click on a hover-capable (mouse) device', () => {
    const { getByText } = render(() => <Tooltip label="Helpful">trigger</Tooltip>)

    fireEvent.click(getByText('trigger'))
    flush()

    expect(queryPanel()).toBeNull()
  })

  it('closes on Escape while open', () => {
    const { getByText } = render(() => <Tooltip label="Helpful">trigger</Tooltip>)

    fireEvent.focusIn(getByText('trigger'))
    flush()
    expect(queryPanel()).not.toBeNull()

    fireEvent.keyDown(document, { key: 'Escape' })
    flush()
    expect(queryPanel()).toBeNull()
  })

  it('closes on a pointer-down outside the trigger', () => {
    const { getByText } = render(() => <Tooltip label="Helpful">trigger</Tooltip>)

    fireEvent.focusIn(getByText('trigger'))
    flush()
    expect(queryPanel()).not.toBeNull()

    fireEvent.pointerDown(document.body)
    flush()
    expect(queryPanel()).toBeNull()
  })

  it('marks the trigger described-by the panel only while open', () => {
    const { getByText } = render(() => <Tooltip label="Helpful">trigger</Tooltip>)
    const trigger = getByText('trigger')

    expect(trigger).not.toHaveAttribute('aria-describedby')

    fireEvent.focusIn(trigger)
    flush()

    const panel = queryPanel()
    expect(trigger).toHaveAttribute('aria-describedby', panel?.id)
  })
})
