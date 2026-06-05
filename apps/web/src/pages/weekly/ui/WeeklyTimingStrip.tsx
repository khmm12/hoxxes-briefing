import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { intervalToDuration, parseISO } from 'date-fns'
import { css, cva } from 'styled-system/css'
import type { WeeklySnapshotResult } from '~/shared/api'
import { getDateTimeFormat, useI18n } from '~/shared/i18n'

type Week = WeeklySnapshotResult['week']

type WeeklyTimingStripProps = {
  now: Date
  expired: boolean
  week: Week
}

// Week range and countdown are one entity — a single time scale reading
// `Jun 1 – 8 · 14:00 · 5d 21h`. Splitting them apart breaks comprehension.
const stripStyles = css.raw({
  display: 'flex',
  alignItems: 'baseline',
  gap: 'ui8',
  minWidth: '0',
  fontVariantNumeric: 'tabular-nums',
})

const rangeStyles = css.raw({
  color: 'text.primary',
  fontSize: { base: '0.875rem', lg: '1rem' },
  fontWeight: '600',
  lineHeight: '1.55',
  whiteSpace: 'nowrap',
})

const separatorStyles = css.raw({
  color: 'text.disabled',
  fontSize: { base: '0.8125rem', lg: '1rem' },
  lineHeight: '1.55',
})

const countdownRecipe = cva({
  base: {
    fontSize: { base: '0.9375rem', lg: '1rem' },
    fontWeight: '600',
    lineHeight: '1.55',
    whiteSpace: 'nowrap',
  },
  variants: {
    // A stale board must not glow like a live countdown.
    tone: {
      live: {
        color: 'brand.hover',
      },
      expired: {
        color: 'danger',
      },
    },
  },
})

export function WeeklyTimingStrip(props: WeeklyTimingStripProps): JSX.Element {
  const i18n = useI18n()

  return (
    <p class={css(stripStyles)}>
      <span class={css(rangeStyles)}>{formatWeekRange(i18n, props.week)}</span>
      <span class={css(separatorStyles)} aria-hidden="true">
        ·
      </span>
      <span class={css(countdownRecipe.raw({ tone: props.expired ? 'expired' : 'live' }))}>
        {props.expired ? i18n._(msg`already ended`) : formatRemaining(i18n, props.week.expiration, props.now)}
      </span>
    </p>
  )
}

// Release and expiration are a fixed 7 days apart in UTC, but a DST shift
// inside the week can desync their local times — so the single time shown
// here is always the *end* time, and the start stays date-only.
function formatWeekRange(i18n: I18n, week: Week): string {
  const start = parseISO(week.release)
  const end = parseISO(week.expiration)
  const days = getDateTimeFormat(i18n.locale, {
    day: 'numeric',
    month: 'short',
  }).formatRange(start, end)
  const time = getDateTimeFormat(i18n.locale, {
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
  }).format(end)

  return `${days} · ${time}`
}

function formatRemaining(i18n: I18n, timestamp: string, now: Date): string {
  const expiration = parseISO(timestamp)

  if (expiration <= now) return i18n._(msg`coming soon`)

  const duration = intervalToDuration({ start: now, end: expiration })
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = duration

  const formatDays = () => i18n._(msg`${days}d`)
  const formatHours = () => i18n._(msg`${hours}h`)
  const formatMinutes = () => i18n._(msg`${minutes}m`)
  const formatSeconds = () => i18n._(msg`${seconds}s`)

  if (days > 0) {
    if (hours > 0) return `${formatDays()} ${formatHours()}`
    if (minutes > 0) return `${formatDays()} ${formatMinutes()}`
    if (seconds > 0) return `${formatDays()} ${formatSeconds()}`
    return `${formatDays()} ${formatHours()}`
  }

  if (hours > 0) {
    if (minutes > 0) return `${formatHours()} ${formatMinutes()}`
    if (seconds > 0) return `${formatHours()} ${formatSeconds()}`
    return `${formatHours()} ${formatMinutes()}`
  }

  return `${formatMinutes()} ${formatSeconds()}`
}
