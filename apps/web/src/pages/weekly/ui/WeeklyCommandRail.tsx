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

// The rail is page chrome, not another card: no raised surface, just content
// rows closed off by a full-width divider.
const railStyles = css.raw({
  display: 'grid',
  rowGap: 'ui12',
})

// paddingInline 16 over the page padding of 8 lines the rail text up with
// the slab text below it.
const contentStyles = css.raw({
  display: 'grid',
  rowGap: 'ui8',
  paddingTop: 'ui8',
  paddingInline: 'ui16',
  lg: {
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    columnGap: 'ui24',
    alignItems: 'center',
  },
})

const metaRowStyles = css.raw({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: { base: 'ui8', lg: 'ui16' },
  minWidth: '0',
})

const dividerStyles = css.raw({
  height: '[1px]',
  background: 'border.strong',
})

export function WeeklyCommandRail(props: WeeklyCommandRailProps): JSX.Element {
  const i18n = useI18n()

  const slogan = createMemo(() => getWeeklySlogan(i18n, props.week.id))

  return (
    <header class={css(railStyles)}>
      <div class={css(contentStyles)}>
        <WeeklyBrandBlock slogan={slogan()} />
        <div class={css(metaRowStyles)}>
          <WeeklyTimingStrip now={props.now} expired={props.state.expired} week={props.week} />
          <WeeklyRefreshPanel state={props.state} onRefresh={props.onRefresh} />
        </div>
      </div>
      <div class={css(dividerStyles)} aria-hidden="true" />
    </header>
  )
}
