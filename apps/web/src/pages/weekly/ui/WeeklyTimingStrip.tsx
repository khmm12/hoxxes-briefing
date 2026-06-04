import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { intervalToDuration, parseISO } from 'date-fns'
import { css, cva } from 'styled-system/css'
import type { SystemStyleObject } from 'styled-system/types'
import type { WeeklySnapshotResult } from '~/shared/api/weekly'
import { formatDate, useI18n } from '~/shared/i18n'

type Week = WeeklySnapshotResult['week']

type WeeklyTimingStripProps = {
  now: Date
  expired: boolean
  week: Week
}

const timingStripStyles = css.raw({
  display: 'grid',
  gridTemplateColumns: { base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
  gap: 'ui8',
})

const timingItemRecipe = cva({
  base: {
    display: 'grid',
    gap: { base: 'ui2', md: 'ui4' },
    minHeight: { base: 'ui48', md: 'ui64' },
    paddingBlock: { base: 'ui8', md: 'ui12' },
    paddingInline: 'ui12',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.subtle',
    borderRadius: 'ui8',
    background: 'surface.sunken',
  },
  variants: {
    placement: {
      default: {},
      remaining: {
        gridColumn: { base: '1 / -1', md: 'auto' },
      },
    },
  },
  defaultVariants: {
    placement: 'default',
  },
})

const timingLabelStyles = css.raw({
  color: 'text.disabled',
  fontSize: '0.875rem',
  fontWeight: '500',
  letterSpacing: '0.02em',
  lineHeight: '1.55',
})

const timingValueRecipe = cva({
  base: {
    color: 'text.primary',
    fontSize: '1rem',
    fontWeight: '600',
    lineHeight: '1.55',
    fontVariantNumeric: 'tabular-nums',
  },
  variants: {
    emphasis: {
      default: {},
      primary: {
        color: 'brand.hover',
        fontSize: '1.25rem',
      },
      // A stale board must not glow like a live countdown.
      expired: {
        color: 'danger',
        fontSize: '1.25rem',
      },
    },
  },
  defaultVariants: {
    emphasis: 'default',
  },
})

const timingStartedValueStyles = css.raw({
  fontSize: { base: '1rem', md: '1.125rem' },
  color: 'parchment.300',
})

const timingEndedValueStyles = css.raw({
  fontWeight: '500',
  fontSize: { base: '1rem', md: '1.125rem' },
})

export function WeeklyTimingStrip(props: WeeklyTimingStripProps): JSX.Element {
  const i18n = useI18n()

  return (
    <dl class={css(timingStripStyles)}>
      <TimingItem
        label={i18n._(msg`Started`)}
        valueCss={timingStartedValueStyles}
        value={formatWeekTimestamp(i18n, props.week.release)}
      />
      <TimingItem
        label={props.expired ? i18n._(msg`Ended`) : i18n._(msg`Ends`)}
        valueCss={timingEndedValueStyles}
        value={formatWeekTimestamp(i18n, props.week.expiration)}
      />
      <TimingItem
        label={props.expired ? i18n._(msg`Reset status`) : i18n._(msg`Time remaining`)}
        placement="remaining"
        emphasis={props.expired ? 'expired' : 'primary'}
        value={props.expired ? i18n._(msg`already ended`) : formatRemaining(i18n, props.week.expiration, props.now)}
      />
    </dl>
  )
}

function TimingItem(props: {
  label: string
  placement?: 'remaining'
  emphasis?: 'expired' | 'primary'
  value: string
  valueCss?: SystemStyleObject
}): JSX.Element {
  return (
    <div class={css(timingItemRecipe.raw({ placement: props.placement ?? 'default' }))}>
      <dt class={css(timingLabelStyles)}>{props.label}</dt>
      <dd
        class={css(
          timingValueRecipe.raw({
            emphasis: props.emphasis ?? 'default',
          }),
          props.valueCss,
        )}
      >
        {props.value}
      </dd>
    </div>
  )
}

function formatWeekTimestamp(i18n: I18n, timestamp: string): string {
  const date = parseISO(timestamp)
  const day = formatDate(i18n.locale, date, {
    day: 'numeric',
    month: 'short',
  })
  const time = formatDate(i18n.locale, date, {
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
  })

  return `${day} · ${time}`
}

export function formatRemaining(i18n: I18n, timestamp: string, now: Date): string {
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
