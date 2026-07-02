// CLEANUP(stage-4): the /api/v1/weekly Vercel function entrypoint — delete with the legacy wire.
import { appDeps, createApp } from '@hoxxes-briefing/api'

export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
}

export default /* @__PURE__ */ createApp(appDeps())
