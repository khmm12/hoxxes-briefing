import { createSignal } from 'solid-js'
import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import type { Briefing } from '~/shared/api'
import { useI18n } from '~/shared/i18n'
import { type ShareOutcome, shareOrCopy } from '~/shared/lib/share-or-copy'
import { ShareIcon } from '~/shared/ui/icon'
import { IconButton } from '~/shared/ui/icon-button'
import { buildShareText } from '../lib/build-share-text'

type ShareButtonProps = {
  briefing: Briefing
}

type FlashTone = 'success' | 'danger'

// Share is always enabled: it works entirely off the already-loaded briefing
// and needs no network — unlike refresh, offline is no reason to disable it.
// The clipboard path confirms with a success flash (mirroring RefreshPanel's
// outcome flash); the native share sheet is its own feedback, so it flashes
// nothing.
export function ShareButton(props: ShareButtonProps): JSX.Element {
  const i18n = useI18n()

  const [flash, setFlash] = createSignal<FlashTone | null>(null)
  const [status, setStatus] = createSignal('')
  const [sharing, setSharing] = createSignal(false)

  async function handleShare(): Promise<void> {
    // Guard reentrancy: a second tap while the native sheet is open would make
    // `navigator.share` reject `InvalidStateError`, which reads as a failure and
    // would spuriously copy behind the still-open sheet. `finally` also frees
    // the guard if `buildShareText` throws.
    if (sharing()) return
    setSharing(true)
    setFlash(null)
    try {
      // Snapshot the briefing before awaiting so the shared text is the one on
      // screen at click time.
      const text = buildShareText(i18n, props.briefing)
      const feedback = resolveFeedback(i18n, await shareOrCopy(text))
      setStatus(feedback.status)
      setFlash(feedback.flash)
    } finally {
      setSharing(false)
    }
  }

  return (
    <>
      <p class={css({ srOnly: true })} role="status" aria-live="polite" aria-atomic="true">
        {status()}
      </p>
      <IconButton
        aria-label={i18n._(msg`Share Deep Dives`)}
        data-flash={flash() ?? undefined}
        type="button"
        onAnimationEnd={() => setFlash(null)}
        onClick={handleShare}
      >
        <ShareIcon />
      </IconButton>
    </>
  )
}

function resolveFeedback(i18n: I18n, outcome: ShareOutcome): { flash: FlashTone | null; status: string } {
  switch (outcome) {
    case 'shared':
      return { flash: null, status: '' }
    case 'copied':
      return { flash: 'success', status: i18n._(msg`Deep Dives copied to clipboard.`) }
    case 'dismissed':
      return { flash: null, status: '' }
    case 'failed':
      return { flash: 'danger', status: i18n._(msg`Couldn't copy the Deep Dives — try again.`) }
    case 'unavailable':
      return { flash: 'danger', status: i18n._(msg`Sharing is not available on this device.`) }
  }
}
