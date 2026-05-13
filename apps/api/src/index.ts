import { serve } from '@hono/node-server'
import { appDeps, createApp } from './app.ts'

const DEFAULT_PORT = 3001

const app = createApp(appDeps())

serve(
  {
    fetch: app.fetch,
    port: Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10),
  },
  (info) => {
    console.log(`API server listening on http://localhost:${info.port}`)
  },
)
