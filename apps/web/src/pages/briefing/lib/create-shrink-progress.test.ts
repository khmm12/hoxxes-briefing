import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRoot, createSignal, flush } from 'solid-js'
import { computeStickDistance, computeWindowProgress, createShrinkProgress } from './create-shrink-progress'

const disposers: Array<() => void> = []

afterEach(() => {
  for (const dispose of disposers.splice(0)) dispose()
  Reflect.deleteProperty(document, 'fonts')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('createShrinkProgress lifecycle', () => {
  it('does no layout work while inactive, then batches activation and scroll writes', () => {
    const h = harness(false)
    h.scroll()
    expect(h.frames.size).toBe(0)
    expect(h.measure).not.toHaveBeenCalled()

    h.setActive(true)
    flush()
    expect(h.measure).not.toHaveBeenCalled()
    expect(h.frames.size).toBe(1)
    h.frame()
    expect(h.measure).toHaveBeenCalledOnce()

    h.write.mockClear()
    h.scroll()
    h.scroll()
    expect(h.frames.size).toBe(1)
    h.frame()
    expect(h.measure).toHaveBeenCalledOnce()
    expect(h.write).not.toHaveBeenCalled()
  })

  it('measures an early restored scroll only once before the deferred frame', () => {
    const h = harness(true)
    h.scroll()
    h.scroll()
    expect(h.measure).toHaveBeenCalledOnce()
    expect(h.frames.size).toBe(1)
    h.frame()
    expect(h.measure).toHaveBeenCalledOnce()
    expect(h.write).toHaveBeenCalledTimes(2)
  })

  it('coalesces resize and font invalidations into one fresh measurement', async () => {
    const h = harness(true)
    h.frame()
    window.dispatchEvent(new Event('resize'))
    h.fonts.dispatchEvent(new Event('loadingdone'))
    h.fontsReady()
    await Promise.resolve()
    expect(h.frames.size).toBe(1)
    expect(h.measure).toHaveBeenCalledOnce()

    h.frame()
    expect(h.measure).toHaveBeenCalledTimes(2)
    h.scroll()
    h.frame()
    expect(h.measure).toHaveBeenCalledTimes(2)
  })

  it('cancels queued work and clears the variables when the desktop layout takes over', async () => {
    const h = harness(true)
    h.frame()
    expect(h.$host.style.getPropertyValue('--shrink-progress')).not.toBe('')
    h.scroll()
    h.setActive(false)
    flush()
    expect(h.frames.size).toBe(0)
    expect(h.$host.style.getPropertyValue('--shrink-progress')).toBe('')
    expect(h.$host.style.getPropertyValue('--shrink-chrome')).toBe('')

    h.fontsReady()
    await Promise.resolve()
    h.scroll()
    h.fonts.dispatchEvent(new Event('loadingdone'))
    window.dispatchEvent(new Event('resize'))
    expect(h.frames.size).toBe(0)

    h.setActive(true)
    flush()
    expect(h.frames.size).toBe(1)
    h.frame()
    expect(h.measure).toHaveBeenCalledTimes(2)
  })

  it('unsubscribes and cancels frames on disposal, including late font completion', async () => {
    const h = harness(true)
    h.dispose()
    expect(h.frames.size).toBe(0)
    h.fontsReady()
    await Promise.resolve()
    h.scroll()
    h.fonts.dispatchEvent(new Event('loadingdone'))
    window.dispatchEvent(new Event('resize'))
    expect(h.frames.size).toBe(0)
    expect(h.measure).not.toHaveBeenCalled()
    expect(h.write).not.toHaveBeenCalled()
  })
})

describe('computeStickDistance', () => {
  it('converts a viewport measurement into the page pin position', () => {
    expect(computeStickDistance(120, 300, 8)).toBe(412)
  })
})

describe('computeWindowProgress', () => {
  it('is linear inside the window and clamped outside', () => {
    expect(computeWindowProgress(100, 165, 48)).toBe(0)
    expect(computeWindowProgress(165, 165, 48)).toBe(0)
    expect(computeWindowProgress(189, 165, 48)).toBe(0.5)
    expect(computeWindowProgress(213, 165, 48)).toBe(1)
    expect(computeWindowProgress(500, 165, 48)).toBe(1)
  })

  it('clamps rubber-band overscroll ahead of a window starting at the page top', () => {
    expect(computeWindowProgress(-40, 0, 48)).toBe(0)
  })
})

// Observe reads/writes without inventing browser geometry in happy-dom.
// Pixel positions and restored scroll are checked by the real-browser suite.
function harness(active: boolean) {
  const frames = new Map<number, FrameRequestCallback>()
  let frameId = 0
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id)
  })
  const { promise: ready, resolve: fontsReady } = Promise.withResolvers<void>()
  const fonts = Object.assign(new EventTarget(), { ready })
  Object.defineProperty(document, 'fonts', { configurable: true, value: fonts })
  const $host = document.createElement('section')
  $host.append(document.createElement('fieldset'))
  document.body.append($host)
  const measure = vi.spyOn($host, 'getBoundingClientRect')
  const write = vi.spyOn($host.style, 'setProperty')
  const [isActive, setActive] = createSignal(active)
  const dispose = createRoot((dispose) => {
    createShrinkProgress({ $host: () => $host, active: isActive })
    return dispose
  })
  disposers.push(() => {
    dispose()
    $host.remove()
  })
  flush()
  return {
    $host,
    measure,
    write,
    frames,
    fonts,
    fontsReady,
    setActive,
    dispose,
    scroll() {
      window.dispatchEvent(new Event('scroll'))
    },
    frame() {
      const pending = [...frames.values()]
      frames.clear()
      for (const callback of pending) callback(performance.now())
    },
  }
}
