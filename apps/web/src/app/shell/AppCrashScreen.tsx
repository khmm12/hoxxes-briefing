import { msg } from '@lingui/core/macro'
import type { JSX } from '@solidjs/web'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import { AlertIcon } from '~/shared/ui/icon'
import { AppLayout } from '~/shared/ui/layout'
import { StateScreen } from '~/shared/ui/state-screen'

type AppCrashScreenProps = {
  onRecover: () => void
}

export function AppCrashScreen(props: AppCrashScreenProps): JSX.Element {
  const i18n = useI18n()

  return (
    <AppLayout>
      <StateScreen
        action={
          <ActionControl component="button" tone="primary" type="button" onClick={() => props.onRecover()}>
            {i18n._(msg`Reload app`)}
          </ActionControl>
        }
        body={i18n._(msg`Reload the app and try again.`)}
        eyebrow={i18n._(msg`Runtime fault`)}
        indicator={<AlertIcon />}
        title={i18n._(msg`App crashed`)}
        tone="danger"
      />
    </AppLayout>
  )
}
