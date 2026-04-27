import { msg } from '@lingui/core/macro'
import { Title } from '@solidjs/meta'
import { A } from '@solidjs/router'
import { type JSX, untrack } from 'solid-js'
import { useI18n } from '~/shared/i18n'
import { ActionControl } from '~/shared/ui/action-button'
import { NotFoundIcon } from '~/shared/ui/icon'
import { AppLayout } from '~/shared/ui/layout'
import { StateScreen } from '~/shared/ui/state-screen'

type NotFoundPageProps = {
  dockVisible: boolean
}

export function NotFoundPage(props: NotFoundPageProps): JSX.Element {
  const i18n = useI18n()
  const pageTitle = untrack(() => i18n._(msg`Hoxxes Briefing | Not Found`))

  return (
    <AppLayout dockVisible={props.dockVisible}>
      <Title>{pageTitle}</Title>
      <StateScreen
        action={
          <ActionControl component={A} href="/">
            {i18n._(msg`Go to weekly board`)}
          </ActionControl>
        }
        body={i18n._(msg`This page is not available here. Head back to the weekly board.`)}
        eyebrow={i18n._(msg`Wrong tunnel`)}
        indicator={<NotFoundIcon />}
        title={i18n._(msg`Page not found`)}
        tone="info"
      />
    </AppLayout>
  )
}
