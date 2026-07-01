import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import type { WeeklySnapshotResult } from '~/shared/api'
import type { BoardViewState } from '../model/weekly-page-state'
import { BoardFooter } from './BoardFooter'
import { DiveDeck } from './DiveDeck'
import { WeeklyCommandRail } from './WeeklyCommandRail'

type BoardProps = {
  now: Date
  state: BoardViewState
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

export function Board(props: BoardProps): JSX.Element {
  return (
    <div class={css(boardShellStyles)}>
      <WeeklyCommandRail now={props.now} state={props.state} week={props.data.week} onRefresh={props.onRefresh} />
      <DiveDeck dives={props.data.dives} expired={props.state.expired} />
      <BoardFooter />
    </div>
  )
}
