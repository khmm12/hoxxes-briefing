import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { css } from 'styled-system/css'
import { token } from 'styled-system/tokens'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import { Eyebrow } from '~/shared/ui/eyebrow'

type PwaNoticeProps = {
  onReload: () => Promise<void> | void
}

const dockStyles = css.raw({
  position: 'fixed',
  insetBlockEnd: `[calc(env(safe-area-inset-bottom) + ${token('spacing.3')})]`,
  zIndex: 'overlay',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: '2',
  alignItems: 'center',
  width: {
    base: `[min(calc(100% - ${token('spacing.8')}), 30rem)]`,
    lg: `[min(24rem, calc(100% - ${token('spacing.12')}))]`,
  },
  paddingBlock: '2',
  paddingInline: '3',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border.subtle',
  borderRadius: 'lg',
  background: 'surface.sunken',
  transform: { base: 'translateX(-50%)', lg: 'none' },
  insetInlineStart: { base: '[50%]', lg: '[auto]' },
  insetInlineEnd: { lg: '6' },
})

const copyStyles = css.raw({
  display: 'grid',
  gap: '1',
  minWidth: '0',
})

const titleStyles = css.raw({
  color: 'text.primary',
  textStyle: 'label.strong',
})

const bodyStyles = css.raw({
  color: 'text.secondary',
  textStyle: 'body.sm',
  overflowWrap: 'anywhere',
})

export function PwaNotice(props: PwaNoticeProps): JSX.Element {
  const i18n = useI18n()

  return (
    <section class={css(dockStyles)} aria-live="polite">
      <div class={css(copyStyles)}>
        <Eyebrow tone="info">{i18n._(msg`App update`)}</Eyebrow>
        <h2 class={css(titleStyles)}>{i18n._(msg`New version ready`)}</h2>
        <p class={css(bodyStyles)}>{i18n._(msg`Reload for the latest app version.`)}</p>
      </div>
      {/* event handlers should be placed to last */}
      <ActionControl component="button" onClick={props.onReload} tone="secondary" type="button">
        {i18n._(msg`Update app`)}
      </ActionControl>
    </section>
  )
}
