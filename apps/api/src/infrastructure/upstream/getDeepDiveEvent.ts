const UPSTREAM_DEEP_DIVE_EVENT_URL = 'https://drg.ghostship.dk/events/deepdive'
const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000
const MAX_UINT32 = 0xffffffff
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/

export type DeepDiveEvent = {
  seed: number
  release: string
  expiration: string
}

type UpstreamDeepDiveEventPayload = {
  SeedV2: unknown
  ExpirationTime: unknown
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const parseSeed = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > MAX_UINT32) {
    throw new Error('Upstream deep dive event contains an invalid SeedV2 value')
  }

  return value
}

const parseIsoTimestamp = (value: unknown): string => {
  if (typeof value !== 'string' || !ISO_TIMESTAMP_PATTERN.test(value)) {
    throw new Error('Upstream deep dive event contains an invalid ExpirationTime timestamp')
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Upstream deep dive event contains an invalid ExpirationTime timestamp')
  }

  return parsedDate.toISOString()
}

const parseUpstreamPayload = (payload: unknown): UpstreamDeepDiveEventPayload => {
  if (!isObjectRecord(payload)) {
    throw new Error('Upstream deep dive event payload must be an object')
  }

  return {
    SeedV2: payload.SeedV2,
    ExpirationTime: payload.ExpirationTime,
  }
}

export const parseDeepDiveEvent = (payload: unknown): DeepDiveEvent => {
  const upstream = parseUpstreamPayload(payload)
  const seed = parseSeed(upstream.SeedV2)
  const expiration = parseIsoTimestamp(upstream.ExpirationTime)
  const release = new Date(new Date(expiration).getTime() - WEEK_IN_MILLISECONDS).toISOString()

  return {
    seed,
    release,
    expiration,
  }
}

export const getDeepDiveEvent = async (fetchImpl: typeof fetch = fetch): Promise<DeepDiveEvent> => {
  const response = await fetchImpl(UPSTREAM_DEEP_DIVE_EVENT_URL)

  if (!response.ok) {
    throw new Error(`Failed to fetch deep dive mission event: HTTP ${response.status}`)
  }

  return parseDeepDiveEvent(await response.json())
}
