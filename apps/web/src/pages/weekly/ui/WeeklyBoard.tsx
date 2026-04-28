import type { JSX } from 'solid-js'
import { msg } from '@lingui/core/macro'
import { css } from 'styled-system/css'
import type { WeeklySnapshotResult } from '~/shared/api/weekly'
import { useI18n } from '~/shared/i18n'
import type { WeeklyBoardViewState } from '../model/weekly-page-state'
import { WeeklyBoardFooter } from './WeeklyBoardFooter'
import { WeeklyCommandRail } from './WeeklyCommandRail'
import { WeeklyRouteSlab } from './WeeklyRouteSlab'

type WeeklyBoardProps = {
  now: Date
  state: WeeklyBoardViewState
  data: WeeklySnapshotResult
  onRefresh: () => void
}

const boardShellStyles = css.raw({
  width: 'content.board',
  maxWidth: '100%',
  display: 'grid',
  marginInline: 'auto',
})

const boardGridStyles = css.raw({
  display: 'grid',
  gap: 'ui12',
  marginTop: 'ui12',
  gridTemplateColumns: { base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
  alignItems: 'stretch',
})

export function WeeklyBoard(props: WeeklyBoardProps): JSX.Element {
  const i18n = useI18n()

  return (
    <div class={css(boardShellStyles)}>
      <WeeklyCommandRail now={props.now} state={props.state} week={props.data.week} onRefresh={props.onRefresh} />
      <section class={css(boardGridStyles)} aria-label={i18n._(msg`Deep dive mission board`)}>
        <WeeklyRouteSlab dive={props.data.dives.normal} expired={props.state.expired} kind="normal" />
        <WeeklyRouteSlab dive={props.data.dives.elite} expired={props.state.expired} kind="elite" />
      </section>
      <WeeklyBoardFooter />
    </div>
  )
}
