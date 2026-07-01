import { createMemo } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import type { WeeklySnapshotResult } from '~/shared/api'
import useI18n from '~/shared/i18n'
import type { BoardViewState } from '../model/weekly-page-state'
import { WeeklyBrandBlock } from './WeeklyBrandBlock'
import { WeeklyRefreshPanel } from './WeeklyRefreshPanel'
import { WeeklyTimingStrip } from './WeeklyTimingStrip'
import { getWeeklySlogan } from './weekly-slogan-copy'

type WeeklyCommandRailProps = {
  now: Date
  state: BoardViewState
  week: WeeklySnapshotResult['week']
  onRefresh: () => void
}

// The rail is page chrome, not another card: no raised surface, just content
// rows closed off by a full-width divider.
const railStyles = css.raw({
  display: 'grid',
  rowGap: '3',
})

// The page gutter already lines the rail text up with the slab edge below
// it — the rail adds no inline padding of its own.
const contentStyles = css.raw({
  display: 'grid',
  rowGap: '2',
  paddingTop: '2',
  md: {
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    columnGap: '6',
    alignItems: 'center',
  },
})

const metaRowStyles = css.raw({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: { base: '2', md: '4' },
  minWidth: '0',
})

// Closes the rail with a full-width stroke: full-bleed across the mobile
// page gutters, back to the content column on desktop.
const dividerStyles = css.raw({
  height: '[1px]',
  background: 'border.strong',
  marginInline: { base: '[calc(var(--layout-inline-padding) * -1)]', md: '0' },
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
