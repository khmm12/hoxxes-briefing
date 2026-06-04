import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import { AlertIcon } from '~/shared/ui/icon'
import { AppLayout } from '~/shared/ui/layout'
import { StateScreen } from '~/shared/ui/state-screen'

type AppCrashScreenProps = {
  dockVisible: boolean
  escalated: boolean
  onRecover: () => void
}

// Renders the app-level crash fallback. The action escalates: the first
// attempt offers a cheap boundary reset, a repeat crash offers a real reload —
// the label always names what the click actually does.
export function AppCrashScreen(props: AppCrashScreenProps): JSX.Element {
  const i18n = useI18n()

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <StateScreen
        action={
          <ActionControl component="button" tone="primary" type="button" onClick={() => props.onRecover()}>
            {props.escalated ? i18n._(msg`Reload app`) : i18n._(msg`Try again`)}
          </ActionControl>
        }
        body={
          props.escalated ? i18n._(msg`Reload the app and try again.`) : i18n._(msg`A quick retry usually clears it.`)
        }
        eyebrow={i18n._(msg`Runtime fault`)}
        indicator={<AlertIcon />}
        title={i18n._(msg`App crashed`)}
        tone="danger"
      />
    </AppLayout>
  )
}
