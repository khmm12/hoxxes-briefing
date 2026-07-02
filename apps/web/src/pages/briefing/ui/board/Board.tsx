import { Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import type { Briefing } from '~/shared/api'
import type { BriefingViewState } from '../../model/briefing-page-state'
import { DiveDeck } from '../dive/DiveDeck'
import { BoardFooter } from './BoardFooter'
import { CommandRail } from './CommandRail'
import { ConfidenceNotice } from './ConfidenceNotice'

type BoardProps = {
  now: Date
  state: BriefingViewState
  data: Briefing
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
      <CommandRail now={props.now} state={props.state} briefing={props.data} onRefresh={props.onRefresh} />
      <Show when={props.data.confidence === 'unverified'}>
        <ConfidenceNotice />
      </Show>
      <DiveDeck dives={props.data.dives} expired={props.state.expired} />
      <BoardFooter />
    </div>
  )
}
