import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { createMemo, type JSX } from 'solid-js'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import { type BoardStatus, resolveBoardStatus, type WeeklyBoardViewState } from '../model/weekly-page-state'

type WeeklyRefreshPanelProps = {
  state: WeeklyBoardViewState
  onRefresh: () => void
}

const freshnessStackStyles = css.raw({
  display: 'grid',
  gap: 'ui8',
})

const commandRowStyles = css.raw({
  display: 'flex',
  justifyContent: 'flex-end',
})

const commandButtonStyles = css.raw({
  minInlineSize: '10rem',
})

const statusStyles = css.raw({
  color: 'text.primary',
  fontSize: '0.875rem',
  fontWeight: '500',
  lineHeight: '1.55',
})

export function WeeklyRefreshPanel(props: WeeklyRefreshPanelProps): JSX.Element {
  const i18n = useI18n()
  const status = createMemo(() => formatBoardStatus(i18n, resolveBoardStatus(props.state)))

  return (
    <div class={css(freshnessStackStyles)}>
      <div class={css(commandRowStyles)}>
        <RefreshCommandButton state={props.state} onRefresh={props.onRefresh} />
      </div>
      <p class={css(statusStyles)} role="status" aria-live="polite" aria-atomic="true">
        {status()}
      </p>
    </div>
  )
}

function RefreshCommandButton(props: WeeklyRefreshPanelProps): JSX.Element {
  const i18n = useI18n()
  const button = createMemo(() => {
    switch (props.state.commandSlot) {
      case 'offline':
        return (
          <ActionControl
            component="button"
            css={commandButtonStyles}
            disabled
            size="compact"
            tone="ghost"
            type="button"
          >
            {i18n._(msg`Offline`)}
          </ActionControl>
        )
      case 'checking':
        return (
          <ActionControl component="button" busy css={commandButtonStyles} size="compact" tone="ghost" type="button">
            {i18n._(msg`Checking...`)}
          </ActionControl>
        )
      case 'refresh':
        return (
          <ActionControl
            component="button"
            css={commandButtonStyles}
            disabled={!props.state.canRefresh}
            onClick={props.onRefresh}
            size="compact"
            tone={props.state.freshness === 'stale-cache' ? 'primary' : 'ghost'}
            type="button"
          >
            {i18n._(msg`Refresh`)}
          </ActionControl>
        )
    }
  })

  return <>{button()}</>
}

function formatBoardStatus(i18n: I18n, status: BoardStatus): string {
  switch (status) {
    case 'live-refreshing':
      return i18n._(msg`Refreshing current board now.`)
    case 'live-refresh-failed':
      return i18n._(msg`Current board still shown. Refresh failed.`)
    case 'live':
      return i18n._(msg`Current board loaded.`)
    case 'cached-refreshing':
      return i18n._(msg`Saved board loaded. Refreshing now.`)
    case 'cached-refresh-failed':
      return i18n._(msg`Saved board still shown. Refresh failed.`)
    case 'cached':
      return i18n._(msg`Saved board loaded.`)
    case 'offline-cache':
      return i18n._(msg`Saved board loaded. You're offline for now.`)
    case 'stale-cache-refresh-failed':
      return i18n._(msg`Last known board still shown. Refresh failed.`)
    case 'stale-cache':
      return i18n._(msg`Last known board only. This cycle already ended.`)
  }
}
