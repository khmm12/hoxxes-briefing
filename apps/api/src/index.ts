import { serve } from '@hono/node-server'
import { app } from './app.ts'

const DEFAULT_PORT = 3001

serve(
  {
    fetch: app.fetch,
    port: Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10),
  },
  (info) => {
    console.log(`API server listening on http://localhost:${info.port}`)
  },
)
