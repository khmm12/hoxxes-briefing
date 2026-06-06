import { action, createEffect, createOptimistic, createSignal } from 'solid-js'
import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import { OfflineIcon, RefreshIcon } from '~/shared/ui/icon'
import { Tooltip } from '~/shared/ui/tooltip'
import type { WeeklyBoardViewState } from '../model/weekly-page-state'

type WeeklyRefreshPanelProps = {
  state: WeeklyBoardViewState
  onRefresh: () => void
}

type StatusTone = 'success' | 'danger' | 'offline'
type FlashTone = 'success' | 'danger'

const panelStyles = css.raw({
  display: 'flex',
  alignItems: 'center',
  gap: 'ui8',
})

// The status slot is always occupied (happy = success dot) and keeps a fixed
// box across tones, so degraded states never shift the layout.
const statusSlotStyles = css.raw({
  display: 'grid',
  placeItems: 'center',
  width: 'ui24',
  height: 'ui24',
  borderRadius: 'full',
})

// The dot reflects validity of the visible board, not the outcome of the
// last request: danger is reserved for "this screen may be lying" (expired).
// A failed refresh of a live board changes nothing — the board is immutable
// within its week — so the event is reported by the button flash alone.
const statusDotRecipe = cva({
  base: {
    width: 'ui8',
    height: 'ui8',
    borderRadius: 'full',
  },
  variants: {
    tone: {
      success: {
        background: 'success',
      },
      danger: {
        background: 'danger',
      },
    },
  },
})

const offlineIconStyles = css.raw({
  color: 'text.disabled',
  fontSize: '0.875rem',
})

// Sized down from the control tokens and pulled in by negative margins so
// the bare icon look of the rail keeps its row height text-driven while the
// real hit target stays 32px.
const refreshButtonStyles = css.raw({
  width: 'ui32',
  height: 'ui32',
  minHeight: 'ui32',
  marginBlock: '-ui8',
  marginInlineEnd: '-ui8',
  paddingInline: 'ui0',
  borderRadius: 'ui8',
  fontSize: '1.125rem',
  flexShrink: 0,
  _flashSuccess: {
    animationStyle: 'flashSuccess',
  },
  _flashDanger: {
    animationStyle: 'flashDanger',
  },
})

export function WeeklyRefreshPanel(props: WeeklyRefreshPanelProps): JSX.Element {
  const i18n = useI18n()

  const [isLoading, setIsLoading] = createOptimistic(false)
  const [flash, setFlash] = createSignal<FlashTone | null>(null)

  // Refresh feedback lives on the button itself: the icon pulses while the
  // manual refresh is pending, then a short color flash for the outcome.
  // Ambient revalidation (page open) is reported by the status dot alone —
  // the button stays calm. There are no toasts in this app.
  // The action only counts settled attempts — reading `refreshFailed` right
  // after `yield` still sees the pre-commit value, so the outcome is read in
  // an effect that runs once the attempt result has landed.
  const [settledAttempts, setSettledAttempts] = createSignal(0)

  const handleRefresh = action(function* () {
    setFlash(null)
    setIsLoading(true)
    props.onRefresh()
    yield
    setSettledAttempts((count) => count + 1)
  })

  createEffect(
    () => ({ attempt: settledAttempts(), failed: props.state.refreshFailed }),
    (value, previous) => {
      if (previous != null && value.attempt !== previous.attempt) {
        setFlash(value.failed ? 'danger' : 'success')
      }
    },
  )

  return (
    <div class={css(panelStyles)}>
      <p class={css({ srOnly: true })} role="status" aria-live="polite" aria-atomic="true">
        {formatBoardStatus(i18n, props.state)}
      </p>
      <Tooltip label={formatBoardStatus(i18n, props.state)} css={statusSlotStyles}>
        {resolveStatusTone(props.state) === 'offline' ? (
          <OfflineIcon css={offlineIconStyles} />
        ) : (
          <span class={css(statusDotRecipe.raw({ tone: props.state.expired ? 'danger' : 'success' }))} />
        )}
      </Tooltip>
      <ActionControl
        aria-label={formatRefreshActionLabel(i18n, props.state)}
        aria-busy={isLoading() ? 'true' : 'false'}
        component="button"
        css={refreshButtonStyles}
        data-flash={flash() ?? undefined}
        disabled={!props.state.online || props.state.refreshing}
        leadingIcon={
          <RefreshIcon
            data-loading={isLoading() ? true : undefined}
            class={css({
              _loading: { animationStyle: 'iconPulse' },
            })}
          />
        }
        size="compact"
        tone="ghost"
        type="button"
        onAnimationEnd={() => setFlash(null)}
        onClick={handleRefresh}
      />
    </div>
  )
}

function resolveStatusTone(state: WeeklyBoardViewState): StatusTone {
  if (state.expired) return 'danger'
  if (!state.online) return 'offline'

  return 'success'
}

function formatRefreshActionLabel(i18n: I18n, state: WeeklyBoardViewState): string {
  if (!state.online) return i18n._(msg`Offline`)
  if (state.refreshing) return i18n._(msg`Refreshing...`)

  return i18n._(msg`Refresh`)
}

function formatBoardStatus(i18n: I18n, state: WeeklyBoardViewState): string {
  const { expired, refreshing, refreshFailed, online, source } = state

  if (expired) {
    if (refreshing) return i18n._(msg`Last known board still shown. Refreshing now.`)
    if (refreshFailed) return i18n._(msg`Last known board still shown. Refresh failed.`)
    return i18n._(msg`Last known board only. This cycle already ended.`)
  }

  if (!online) return i18n._(msg`Saved board loaded. You're offline for now.`)

  if (source === 'cache') {
    if (refreshing) return i18n._(msg`Saved board loaded. Refreshing now.`)
    return i18n._(msg`Saved board loaded.`)
  }

  if (refreshing) return i18n._(msg`Refreshing current board now.`)

  return i18n._(msg`Current board loaded.`)
}
