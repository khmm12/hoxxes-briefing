import { action, createOptimistic } from 'solid-js'
import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import { RefreshIcon } from '~/shared/ui/icon'
import type { WeeklyBoardViewState } from '../model/weekly-page-state'

type WeeklyRefreshPanelProps = {
  state: WeeklyBoardViewState
  onRefresh: () => void
}

const statusShelfStyles = css.raw({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto auto',
  gap: 'ui12',
  alignItems: 'center',
  minHeight: 'ui64',
  paddingBlock: 'ui8',
  paddingInline: 'ui12',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border.subtle',
  borderRadius: 'ui8',
  background: 'surface.sunken',
  order: { base: 0, lg: -1 },
})

const commandButtonStyles = css.raw({
  width: { base: 'ui40', md: 'ui44' },
  height: { base: 'ui40', md: 'ui44' },
  minHeight: { base: 'ui40', md: 'ui44' },
  paddingInline: 'ui0',
  borderRadius: 'ui8',
  fontSize: { base: '1.25rem', md: '1.5rem' },
  flexShrink: 0,
})

// Failure and staleness must be visible at a glance, not only readable:
// the slab already paints "Last known board" in danger — the rail follows.
const statusRecipe = cva({
  base: {
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.55',
    minWidth: '0',
  },
  variants: {
    tone: {
      neutral: {
        color: 'text.primary',
      },
      danger: {
        color: 'danger',
      },
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

const dividerStyles = css.raw({
  width: '[1px]',
  height: { base: '[1.5rem]', md: '[1.75rem]' },
  background: 'border.strong',
})

export function WeeklyRefreshPanel(props: WeeklyRefreshPanelProps): JSX.Element {
  const i18n = useI18n()

  const [isLoading, setIsLoading] = createOptimistic(false)

  const handleRefresh = action(function* () {
    setIsLoading(true)
    props.onRefresh()
    yield
  })

  return (
    <div class={css(statusShelfStyles)}>
      <p
        class={css(statusRecipe.raw({ tone: formatBoardStatusTone(props.state) }))}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatBoardStatus(i18n, props.state)}
      </p>
      <span class={css(dividerStyles)} aria-hidden="true" />
      <ActionControl
        aria-label={formatRefreshActionLabel(i18n, props.state)}
        aria-busy={isLoading() ? 'true' : 'false'}
        component="button"
        css={commandButtonStyles}
        disabled={!props.state.online || props.state.refreshing}
        onClick={handleRefresh}
        leadingIcon={
          <RefreshIcon
            data-loading={isLoading() ? true : undefined}
            class={css({
              animation: { base: 'none', _loading: 'spin 1s linear infinite' },
            })}
          />
        }
        size="compact"
        tone={props.state.expired && props.state.online ? 'primary' : 'ghost'}
        type="button"
      ></ActionControl>
    </div>
  )
}

function formatRefreshActionLabel(i18n: I18n, state: WeeklyBoardViewState): string {
  if (!state.online) return i18n._(msg`Offline`)
  if (state.refreshing) return i18n._(msg`Refreshing...`)

  return i18n._(msg`Refresh`)
}

function formatBoardStatusTone(state: WeeklyBoardViewState): 'danger' | 'neutral' {
  return state.expired || state.refreshFailed ? 'danger' : 'neutral'
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
    if (refreshFailed) return i18n._(msg`Saved board still shown. Refresh failed.`)
    return i18n._(msg`Saved board loaded.`)
  }

  if (refreshing) return i18n._(msg`Refreshing current board now.`)
  if (refreshFailed) return i18n._(msg`Current board still shown. Refresh failed.`)

  return i18n._(msg`Current board loaded.`)
}
