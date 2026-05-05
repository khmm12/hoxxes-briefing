import { createMemo } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import type { WeeklySnapshotResult } from '~/shared/api/weekly'
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
  const i18n = useI18n()

  const slogan = createMemo(() => getWeeklySlogan(i18n, props.week.id))

  return (
    <header class={css(railStyles)}>
      <WeeklyBrandBlock slogan={slogan()} />
      <div class={css(readoutStyles)}>
        <WeeklyRefreshPanel state={props.state} onRefresh={props.onRefresh} />
        <WeeklyTimingStrip now={props.now} expired={props.state.expired} week={props.week} />
      </div>
    </header>
  )
}
