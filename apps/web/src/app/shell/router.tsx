import { createContext, lazy, useContext } from 'solid-js'
import { createRouter, type RouterProps } from '@solidjs/router'
import type { JSX } from '@solidjs/web'
import { BriefingPage } from '~/pages/briefing'

const NotFoundPage = /* @__PURE__ */ lazy(() =>
  import('~/pages/not-found').then((module) => ({ default: module.NotFoundPage })),
)

// Dev-only state playground; the false branch is statically eliminated, so
// neither the route nor its chunk exists in production builds.
const PlaygroundPage = import.meta.env.DEV
  ? /* @__PURE__ */ lazy(() => import('~/pages/briefing/dev').then((module) => ({ default: module.PlaygroundPage })))
  : null

const BriefingRouteContext = /* @__PURE__ */ createContext<() => void>()

const Router = /* @__PURE__ */ createRouter({
  routes: [
    { path: '/', component: BriefingRoute },
    ...(PlaygroundPage != null ? [{ path: '/__playground/:scenario?', component: PlaygroundPage }] : []),
    { path: '*404', component: NotFoundPage },
  ],
})

export function AppRouter(props: { onUpdateApp: () => void; children?: RouterProps['children'] }): JSX.Element {
  return (
    <BriefingRouteContext value={() => props.onUpdateApp()}>
      <Router>{props.children}</Router>
    </BriefingRouteContext>
  )
}

function BriefingRoute(): JSX.Element {
  return <BriefingPage onUpdateApp={useContext(BriefingRouteContext)} />
}
