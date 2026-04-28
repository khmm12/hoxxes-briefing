import { createMemo, type JSX, Match, Switch } from 'solid-js'
import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import type { WeeklyBoardViewState } from '../model/weekly-page-state'

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
  const status = createMemo(() => formatBoardStatus(i18n, props.state))

  const button = createMemo(() => {
    return (
      <ActionControl
        component="button"
        css={commandButtonStyles}
        disabled={!props.state.online || props.state.refreshing}
        onClick={props.onRefresh}
        size="compact"
        tone={props.state.expired && props.state.online ? 'primary' : 'ghost'}
        type="button"
      >
        <Switch fallback={i18n._(msg`Refresh`)}>
          <Match when={!props.state.online}>{i18n._(msg`Offline`)}</Match>
          <Match when={props.state.refreshing}>{i18n._(msg`Refreshing...`)}</Match>
        </Switch>
      </ActionControl>
    )
  })

  return (
    <div class={css(freshnessStackStyles)}>
      <div class={css(commandRowStyles)}>{button()}</div>
      <p class={css(statusStyles)} role="status" aria-live="polite" aria-atomic="true">
        {status()}
      </p>
    </div>
  )
}

function formatBoardStatus(i18n: I18n, state: WeeklyBoardViewState): string {
  const { expired, refreshing, refreshFailed, online, source } = state

  if (expired) {
    return refreshFailed
      ? i18n._(msg`Last known board still shown. Refresh failed.`)
      : i18n._(msg`Last known board only. This cycle already ended.`)
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
