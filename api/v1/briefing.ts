import { appDeps, createApp } from '@hoxxes-briefing/api'

export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
}

export default /* @__PURE__ */ createApp(appDeps())
