export type ShareOutcome = 'shared' | 'copied' | 'dismissed' | 'failed' | 'unavailable'

/**
 * Hands a ready text block to the platform: the native share sheet when it is
 * available and willing, otherwise the clipboard. Degrades on absence rather
 * than throwing (mirrors `create-local-storage`): a browser without either API
 * returns `unavailable` instead of raising at the call site.
 *
 * Only Web Share's `text` field is used, never `url`: with both set, macOS
 * share targets split them (Copy keeps only the url, an app receives only the
 * text). The block is self-contained — its link already lives in the footer —
 * so one `text` field keeps every target whole.
 *
 * A dismissed share sheet returns `dismissed` and does not silently copy; a
 * failed one (blocked, not just cancelled) falls back to the clipboard so the
 * user is never left with nothing. The two no-text results are kept distinct:
 * `unavailable` means no transport exists at all (permanent), `failed` means a
 * present clipboard rejected the write (transient — worth a retry).
 */
export async function shareOrCopy(text: string): Promise<ShareOutcome> {
  if (canWebShare(text)) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (error) {
      if (isAbortError(error)) return 'dismissed'
    }
  }

  return copyToClipboard(text)
}

async function copyToClipboard(text: string): Promise<ShareOutcome> {
  if (typeof navigator === 'undefined' || navigator.clipboard?.writeText == null) {
    return 'unavailable'
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}

function canWebShare(text: string): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false

  return navigator.canShare?.({ text }) ?? true
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
