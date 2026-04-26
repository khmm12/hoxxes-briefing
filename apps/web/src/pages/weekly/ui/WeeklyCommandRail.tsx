import type { ApiV1WeeklyResponse } from '@hoxxes-briefing/contracts/api/v1'
import type { Accessor, JSX } from 'solid-js'
import { createSignal, onCleanup } from 'solid-js'
import { css } from 'styled-system/css'
import type { WeeklyBoardViewState } from '../model/weekly-page-state'
import { WeeklyBrandBlock } from './WeeklyBrandBlock'
import { WeeklyRefreshPanel } from './WeeklyRefreshPanel'
import { WeeklyTimingStrip } from './WeeklyTimingStrip'

type WeeklyCommandRailProps = {
  state: WeeklyBoardViewState
  weekly: ApiV1WeeklyResponse
  onRefresh: () => void
}

const railStyles = css.raw({
  display: 'grid',
  gap: { base: 'ui8', md: 'ui12' },
  alignItems: 'start',
  paddingBlock: { base: 'ui12', md: 'ui16' },
  paddingInline: { base: 'ui12', md: 'ui16' },
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border.subtle',
  borderRadius: 'ui12',
  background: 'surface.raised',
  boxShadow: 'elevation.medium',
  overflow: 'hidden',
  gridTemplateColumns: { base: '1fr', md: 'minmax(0, 1.2fr) minmax(0, 1fr)' },
})

const readoutStyles = css.raw({
  display: 'grid',
  gap: 'ui12',
})

export function WeeklyCommandRail(props: WeeklyCommandRailProps): JSX.Element {
  const now = createMinuteClock()

  return (
    <header class={css(railStyles)}>
      <WeeklyBrandBlock now={now} />
      <div class={css(readoutStyles)}>
        <WeeklyRefreshPanel state={props.state} onRefresh={props.onRefresh} />
        <WeeklyTimingStrip now={now} state={props.state} week={props.weekly.week} />
      </div>
    </header>
  )
}

function createMinuteClock(): Accessor<Date> {
  const [now, setNow] = createSignal(new Date())
  const intervalID = globalThis.setInterval(() => setNow(new Date()), 60_000)

  onCleanup(() => globalThis.clearInterval(intervalID))

  return now
}
