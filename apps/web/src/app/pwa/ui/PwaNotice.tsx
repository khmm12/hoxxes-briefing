import type { JSX } from 'solid-js'
import { msg } from '@lingui/core/macro'
import { css } from 'styled-system/css'
import { token } from 'styled-system/tokens'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'

type PwaNoticeProps = {
  onReload: () => Promise<void> | void
}

const dockStyles = css.raw({
  position: 'fixed',
  insetBlockEnd: `calc(env(safe-area-inset-bottom) + ${token('spacing.ui12')})`,
  zIndex: 18,
  display: 'grid',
  gridTemplateColumns: { base: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) auto' },
  gap: { base: 'ui12', md: 'ui8' },
  alignItems: 'center',
  width: {
    base: `min(calc(100% - ${token('spacing.ui16')}), 30rem)`,
    lg: `min(24rem, calc(100% - ${token('spacing.ui48')}))`,
  },
  paddingBlock: { base: 'ui12', md: 'ui8' },
  paddingInline: { base: 'ui12', md: 'ui12' },
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border.subtle',
  borderRadius: 'ui12',
  background: { base: 'surface', lg: 'surface.sunken' },
  boxShadow: 'elevation.none',
  transform: { base: 'translateX(-50%)', lg: 'none' },
  insetInlineStart: { base: '50%', lg: 'auto' },
  insetInlineEnd: { lg: 'ui24' },
})

const copyStyles = css.raw({
  display: 'grid',
  gap: 'ui4',
  minWidth: 0,
})

const eyebrowStyles = css.raw({
  color: 'info',
  fontFamily: 'display',
  fontSize: '0.875rem',
  fontWeight: '700',
  letterSpacing: '0.04em',
  lineHeight: '1.333',
  textTransform: 'uppercase',
})

const titleStyles = css.raw({
  color: 'text.primary',
  fontSize: '0.875rem',
  fontWeight: '600',
  lineHeight: '1.333',
})

const bodyStyles = css.raw({
  color: 'text.secondary',
  fontSize: '0.875rem',
  lineHeight: '1.55',
  overflowWrap: 'anywhere',
})

const actionSlotStyles = css.raw({
  display: 'grid',
  justifyItems: { base: 'stretch', md: 'end' },
})

const actionStyles = css.raw({
  width: { base: '100%', md: 'auto' },
})

export function PwaNotice(props: PwaNoticeProps): JSX.Element {
  const i18n = useI18n()

  return (
    <section class={css(dockStyles)} aria-live="polite">
      <div class={css(copyStyles)}>
        <p class={css(eyebrowStyles)}>{i18n._(msg`App update`)}</p>
        <h2 class={css(titleStyles)}>{i18n._(msg`New version ready`)}</h2>
        <p class={css(bodyStyles)}>{i18n._(msg`Reload for the latest app version.`)}</p>
      </div>
      <div class={css(actionSlotStyles)}>
        {/* event handlers should be placed to last */}
        <ActionControl
          component="button"
          css={actionStyles}
          onClick={props.onReload}
          size="compact"
          tone="secondary"
          type="button"
        >
          {i18n._(msg`Update app`)}
        </ActionControl>
      </div>
    </section>
  )
}
