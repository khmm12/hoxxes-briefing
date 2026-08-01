import { subWeeks } from 'date-fns/subWeeks'
import * as v from 'valibot'

const UPSTREAM_DEEP_DIVE_EVENT_URL = 'https://drg.ghostship.dk/events/deepdive'
const UPSTREAM_TIMEOUT_MS = 8_000

const uint32 = /* @__PURE__ */ v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xffffffff))

const deepDiveResponseSchema = /* @__PURE__ */ v.pipe(
  v.object({
    SeedV2: v.pipe(uint32, v.description('Upstream deep dive event contains an invalid SeedV2 value')),
    ExpirationTime: v.pipe(
      v.string(),
      v.isoTimestamp(),
      v.description('Upstream deep dive event contains an invalid ExpirationTime timestamp'),
    ),
  }),
  v.readonly(),
)

export type DeepDiveEvent = {
  seed: number
  release: string
  expiration: string
}

export async function getDeepDiveEvent(
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = UPSTREAM_TIMEOUT_MS,
): Promise<DeepDiveEvent> {
  const response = await fetchImpl(UPSTREAM_DEEP_DIVE_EVENT_URL, { signal: AbortSignal.timeout(timeoutMs) })

  if (!response.ok) throw new Error(`Failed to fetch deep dive mission event: HTTP ${response.status}`)

  return parseDeepDiveEvent(await response.json())
}

function parseDeepDiveEvent(payload: unknown): DeepDiveEvent {
  const { SeedV2: seed, ExpirationTime } = v.parse(deepDiveResponseSchema, payload)

  const expiration = new Date(ExpirationTime).toISOString()
  const release = subWeeks(new Date(expiration), 1).toISOString()

  return {
    seed,
    release,
    expiration,
  }
}
