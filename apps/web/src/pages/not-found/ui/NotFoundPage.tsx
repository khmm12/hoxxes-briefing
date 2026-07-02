import { msg } from '@lingui/core/macro'
import { A } from '@solidjs/router'
import type { JSX } from '@solidjs/web'
import { useI18n } from '~/shared/i18n'
import { Title } from '~/shared/lib/document-head'
import { ActionControl } from '~/shared/ui/action-button'
import { NotFoundIcon } from '~/shared/ui/icon'
import { StateScreen } from '~/shared/ui/state-screen'

export function NotFoundPage(): JSX.Element {
  const i18n = useI18n()

  return (
    <>
      <Title>{i18n._(msg`Hoxxes Briefing | Not Found`)}</Title>
      <StateScreen
        action={
          <ActionControl component={A} href="/">
            {i18n._(msg`Go to the briefing`)}
          </ActionControl>
        }
        body={i18n._(msg`This page is not available here. Head back to the briefing.`)}
        eyebrow={i18n._(msg`Wrong tunnel`)}
        indicator={<NotFoundIcon />}
        title={i18n._(msg`Page not found`)}
        tone="info"
      />
    </>
  )
}
