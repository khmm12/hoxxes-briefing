import { afterEach, describe, expect, it, vi } from 'vitest'
import { shareOrCopy } from './share-or-copy'

const text = 'Deep Dives · Jul 11 – 18\n\n⛏️ Hoxxes Briefing · Rock and Stone!\nhttps://hoxxes-briefing.vercel.app'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('shareOrCopy', () => {
  it('shares the block through the native sheet as one text field, no url', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share })

    await expect(shareOrCopy(text)).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith({ text })
  })

  it('respects a canShare veto and falls back to the clipboard', async () => {
    const share = vi.fn()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share, canShare: () => false, clipboard: { writeText } })

    await expect(shareOrCopy(text)).resolves.toBe('copied')
    expect(share).not.toHaveBeenCalled()
  })

  it('reports a dismissed share sheet without copying', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('user cancelled', 'AbortError'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share, clipboard: { writeText } })

    await expect(shareOrCopy(text)).resolves.toBe('dismissed')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('falls back to the clipboard when the share sheet fails for another reason', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('blocked', 'NotAllowedError'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share, clipboard: { writeText } })

    await expect(shareOrCopy(text)).resolves.toBe('copied')
  })

  it('copies the block verbatim when no share sheet exists', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(shareOrCopy(text)).resolves.toBe('copied')
    expect(writeText).toHaveBeenCalledWith(text)
  })

  it('reports unavailable when neither share nor clipboard is present', async () => {
    vi.stubGlobal('navigator', {})

    await expect(shareOrCopy(text)).resolves.toBe('unavailable')
  })

  it('reports a transient failure when a present clipboard rejects the write', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(shareOrCopy(text)).resolves.toBe('failed')
  })
})
