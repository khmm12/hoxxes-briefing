import * as v1 from '@hoxxes-briefing/contracts/api/v1'

// The app's typed view of the briefing wire. The page consumes these domain
// types by name instead of indexing structurally off `Briefing`.
export type {
  DeepDive,
  DeepDiveAnomaly,
  DeepDiveBiome,
  DeepDiveDreadnought,
  DeepDiveMission,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
} from '@hoxxes-briefing/contracts/api/v1'

export const briefingUrl = '/api/v1/briefing'

export type FetchBriefingOptions = {
  fetch?: typeof fetch
  request?: RequestInfo | URL
  signal?: AbortSignal
}

export type Briefing = v1.BriefingResponse

type BriefingRequestErrorKind = 'network' | 'api' | 'invalid-payload'

type BriefingRequestErrorOptions = {
  cause?: unknown
  publicError?: v1.ErrorResponse
  status?: number
}

export class BriefingRequestError extends Error {
  kind: BriefingRequestErrorKind
  status?: number
  publicError?: v1.ErrorResponse

  constructor(kind: BriefingRequestErrorKind, message: string, options: BriefingRequestErrorOptions = {}) {
    super(message, options.cause == null ? undefined : { cause: options.cause })
    this.name = 'BriefingRequestError'
    this.kind = kind
    this.status = options.status
    this.publicError = options.publicError
  }
}

export async function fetchBriefing(options: FetchBriefingOptions): Promise<Briefing> {
  const request = options.request ?? briefingUrl
  const fetchImpl = options.fetch ?? fetch
  let response: Response

  try {
    response = await fetchImpl(request, {
      signal: options.signal,
      headers: {
        accept: 'application/json',
      },
    })
  } catch (cause) {
    throw new BriefingRequestError('network', 'Failed to reach the briefing API endpoint.', { cause })
  }

  let rawPayload: unknown

  try {
    rawPayload = await response.json()
  } catch (cause) {
    throw new BriefingRequestError('invalid-payload', 'Briefing API returned invalid JSON.', {
      cause,
      status: response.status,
    })
  }

  if (!response.ok) {
    let publicError: v1.ErrorResponse | undefined

    try {
      publicError = v1.parseErrorResponse(rawPayload)
    } catch {
      publicError = undefined
    }

    throw new BriefingRequestError(
      'api',
      publicError?.message ?? `Briefing API request failed with status ${response.status}.`,
      {
        publicError,
        status: response.status,
      },
    )
  }

  let parsedPayload: v1.BriefingResponse

  try {
    parsedPayload = v1.parseBriefingResponse(rawPayload)
  } catch (cause) {
    throw new BriefingRequestError('invalid-payload', 'Briefing API payload does not match the public contract.', {
      cause,
      status: response.status,
    })
  }

  return parsedPayload
}
