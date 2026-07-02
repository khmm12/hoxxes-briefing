import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import { Eyebrow } from '~/shared/ui/eyebrow'
import { AlertIcon } from '~/shared/ui/icon'

// Advisory for `confidence === 'unverified'` (ADR 0002): the generator is
// running a pre-season algorithm, so the briefing is plausible but unconfirmed.
// Non-blocking — it rides above otherwise-normal data. Designed as
// "Confidence Notice" in designs/hoxxes-briefing.pen (info-toned strip).
const noticeStyles = css.raw({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '3',
  marginTop: { base: '3', md: '4' },
  paddingBlock: '3',
  paddingInline: '4',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'info.border',
  borderRadius: 'md',
  background: 'info.surface',
})

const iconStyles = css.raw({
  width: '5',
  height: '5',
  color: 'info',
})

const copyStyles = css.raw({
  display: 'grid',
  gap: '1',
  minWidth: '0',
})

const bodyStyles = css.raw({
  color: 'text.secondary',
  textStyle: 'body.sm',
})

export function ConfidenceNotice(): JSX.Element {
  const i18n = useI18n()

  return (
    <section class={css(noticeStyles)} aria-live="polite">
      <AlertIcon css={iconStyles} />
      <div class={css(copyStyles)}>
        <Eyebrow tone="info">{i18n._(msg`Unverified briefing`)}</Eyebrow>
        <p class={css(bodyStyles)}>
          {i18n._(msg`Mission Control has not verified this briefing yet. Dive details may change.`)}
        </p>
      </div>
    </section>
  )
}
