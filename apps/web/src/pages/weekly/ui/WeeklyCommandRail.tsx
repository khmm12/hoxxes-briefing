import { createMemo } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import type { WeeklySnapshotResult } from '~/shared/api'
import useI18n from '~/shared/i18n'
import type { WeeklyBoardViewState } from '../model/weekly-page-state'
import { WeeklyBrandBlock } from './WeeklyBrandBlock'
import { WeeklyRefreshPanel } from './WeeklyRefreshPanel'
import { WeeklyTimingStrip } from './WeeklyTimingStrip'
import { getWeeklySlogan } from './weekly-slogan-copy'

type WeeklyCommandRailProps = {
  now: Date
  state: WeeklyBoardViewState
  week: WeeklySnapshotResult['week']
  onRefresh: () => void
}

const railStyles = css.raw({
  display: 'grid',
  gap: { base: 'ui12', md: 'ui16' },
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
  gridTemplateColumns: '1fr',
  '@media (min-width: 1200px)': {
    alignItems: 'center',
    gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
  },
})

const readoutStyles = css.raw({
  display: 'grid',
  gap: 'ui8',
  minWidth: '0',
})

export function WeeklyCommandRail(props: WeeklyCommandRailProps): JSX.Element {
  const i18n = useI18n()

  const slogan = createMemo(() => getWeeklySlogan(i18n, props.week.id))

  return (
    <header class={css(railStyles)}>
      <WeeklyBrandBlock slogan={slogan()} />
      <div class={css(readoutStyles)}>
        <WeeklyTimingStrip now={props.now} expired={props.state.expired} week={props.week} />
        <WeeklyRefreshPanel state={props.state} onRefresh={props.onRefresh} />
      </div>
    </header>
  )
}
