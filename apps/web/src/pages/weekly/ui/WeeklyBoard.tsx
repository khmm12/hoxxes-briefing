import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import type { WeeklySnapshotResult } from '~/shared/api'
import type { WeeklyBoardViewState } from '../model/weekly-page-state'
import { WeeklyBoardFooter } from './WeeklyBoardFooter'
import { WeeklyCommandRail } from './WeeklyCommandRail'
import { WeeklyRouteDeck } from './WeeklyRouteDeck'

type WeeklyBoardProps = {
  now: Date
  state: WeeklyBoardViewState
  data: WeeklySnapshotResult
  onRefresh: () => void
}

const boardShellStyles = css.raw({
  width: 'content.board',
  maxWidth: 'full',
  display: 'grid',
  gridAutoRows: 'max',
  marginInline: 'auto',
})

export function WeeklyBoard(props: WeeklyBoardProps): JSX.Element {
  return (
    <div class={css(boardShellStyles)}>
      <WeeklyCommandRail now={props.now} state={props.state} week={props.data.week} onRefresh={props.onRefresh} />
      <WeeklyRouteDeck dives={props.data.dives} expired={props.state.expired} />
      <WeeklyBoardFooter />
    </div>
  )
}
