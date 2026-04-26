import type { ApiV1WeeklyResponse } from '@hoxxes-briefing/contracts/api/v1'
import { msg } from '@lingui/core/macro'
import type { JSX } from 'solid-js'
import { css } from 'styled-system/css'
import { useI18n } from '~/shared/i18n'
import type { WeeklyBoardViewState } from '../model/weekly-page-state'
import { WeeklyBoardFooter } from './WeeklyBoardFooter'
import { WeeklyCommandRail } from './WeeklyCommandRail'
import { WeeklyRouteSlab } from './WeeklyRouteSlab'

type WeeklyBoardProps = {
  state: WeeklyBoardViewState
  weekly: ApiV1WeeklyResponse
  onRefresh: () => void
}

const boardShellStyles = css.raw({
  display: 'grid',
})

const boardGridStyles = css.raw({
  display: 'grid',
  gap: 'ui12',
  minHeight: 'min(52rem, calc(100svh - 10rem))',
  marginTop: 'ui12',
  gridTemplateColumns: { base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
  alignItems: 'stretch',
})

export function WeeklyBoard(props: WeeklyBoardProps): JSX.Element {
  const i18n = useI18n()

  return (
    <div class={css(boardShellStyles)}>
      <WeeklyCommandRail state={props.state} weekly={props.weekly} onRefresh={props.onRefresh} />
      <section class={css(boardGridStyles)} aria-label={i18n._(msg`Deep dive mission board`)}>
        <WeeklyRouteSlab
          dive={props.weekly.dives.normal}
          isExpired={props.state.freshness === 'stale-cache'}
          kind="normal"
        />
        <WeeklyRouteSlab
          dive={props.weekly.dives.elite}
          isExpired={props.state.freshness === 'stale-cache'}
          kind="elite"
        />
      </section>
      <WeeklyBoardFooter />
    </div>
  )
}
