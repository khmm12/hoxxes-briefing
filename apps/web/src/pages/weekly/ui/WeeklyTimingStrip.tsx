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
  gridTemplateColumns: {
    base: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(3, minmax(0, 1fr))',
  },
  gap: 'ui8',
})

const timingItemRecipe = cva({
  base: {
    display: 'grid',
    gap: { base: 'ui2', md: 'ui4' },
    paddingBlock: 'ui12',
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
      started: {
        gridColumn: { base: '1 / -1', md: 'auto' },
        order: { base: 3, md: 0 },
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
    },
  },
  defaultVariants: {
    emphasis: 'default',
  },
})

const timingStartedValueStyles = css.raw({
  fontSize: { base: '0.875rem', md: '1rem' },
  color: 'parchment.300',
})

const timingEndedValueStyles = css.raw({
  fontWeight: '500',
  fontSize: '1.25rem',
})

const timingMetaStyles = css.raw({
  color: 'text.disabled',
  fontSize: '0.875rem',
  lineHeight: '1.55',
})

export function WeeklyTimingStrip(props: WeeklyTimingStripProps): JSX.Element {
  const i18n = useI18n()

  return (
    <>
      <dl class={css(timingStripStyles)}>
        <TimingItem
          label={i18n._(msg`Started`)}
          placement="started"
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
          primary
          value={props.expired ? i18n._(msg`already ended`) : formatRemaining(i18n, props.week.expiration, props.now)}
        />
      </dl>
      <p class={css(timingMetaStyles)}>
        {i18n._(msg`Local time`)} · {formatTimezoneOffset(props.now)}
      </p>
    </>
  )
}

function TimingItem(props: {
  label: string
  placement?: 'started'
  primary?: boolean
  value: string
  valueCss?: SystemStyleObject
}): JSX.Element {
  return (
    <div class={css(timingItemRecipe.raw({ placement: props.placement ?? 'default' }))}>
      <dt class={css(timingLabelStyles)}>{props.label}</dt>
      <dd
        class={css(
          timingValueRecipe.raw({
            emphasis: props.primary === true ? 'primary' : 'default',
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

  const duration = intervalToDuration({ start: now, end: expiration })
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = duration

  if (days > 0) return i18n._(msg`${days}d ${hours}h`)
  if (hours > 0) return i18n._(msg`${hours}h ${minutes}m`)
  if (minutes > 0) return i18n._(msg`${minutes}m ${seconds}s`)
  if (seconds > 0) return i18n._(msg`${seconds}s`)

  return i18n._(msg`coming soon`)
}

function formatTimezoneOffset(now: Date): string {
  const offsetMinutes = -now.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteMinutes = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteMinutes / 60)
  const minutes = absoluteMinutes % 60

  if (minutes === 0) {
    return `UTC${sign}${hours}`
  }

  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`
}
