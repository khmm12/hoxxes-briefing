import { msg } from '@lingui/core/macro'
import { useHref } from '@solidjs/router'
import type { JSX } from '@solidjs/web'
import { useI18n } from '~/shared/i18n'
import { Meta, Title } from '~/shared/lib/document-head'
import { ActionControl } from '~/shared/ui/action-button'
import { NotFoundIcon } from '~/shared/ui/icon'
import { StateScreen } from '~/shared/ui/state-screen'

export function NotFoundPage(): JSX.Element {
  const i18n = useI18n()
  const briefingHref = useHref(() => '/')

  return (
    <>
      <Title>{i18n._(msg`Page not found — Hoxxes Briefing`)}</Title>
      {/* The SPA rewrite serves every path with HTTP 200, so this state is the
          only 404 signal crawlers get — noindex keeps stray URLs out of the
          index instead of registering as soft 404s. */}
      <Meta name="robots" content="noindex" />
      <Meta name="description" content={i18n._(msg`This page is not available here. Head back to the briefing.`)} />
      <StateScreen
        action={
          <ActionControl component="a" href={briefingHref()}>
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
