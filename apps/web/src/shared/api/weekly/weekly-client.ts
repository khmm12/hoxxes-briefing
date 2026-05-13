import * as v1 from '@hoxxes-briefing/contracts/api/v1'

export const weeklySnapshotUrl = '/api/v1/weekly'

export type FetchWeeklySnapshotOptions = {
  fetch?: typeof fetch
  request?: RequestInfo | URL
  signal?: AbortSignal
}

export type WeeklySnapshotResult = v1.WeeklyResponse

type WeeklyRequestErrorKind = 'network' | 'api' | 'invalid-payload'

type WeeklyRequestErrorOptions = {
  cause?: unknown
  publicError?: v1.ErrorResponse
  status?: number
}

export class WeeklyRequestError extends Error {
  kind: WeeklyRequestErrorKind
  status?: number
  publicError?: v1.ErrorResponse

  constructor(kind: WeeklyRequestErrorKind, message: string, options: WeeklyRequestErrorOptions = {}) {
    super(message, options.cause == null ? undefined : { cause: options.cause })
    this.name = 'WeeklyRequestError'
    this.kind = kind
    this.status = options.status
    this.publicError = options.publicError
  }
}

export async function fetchWeeklySnapshot(options: FetchWeeklySnapshotOptions): Promise<WeeklySnapshotResult> {
  const request = options.request ?? weeklySnapshotUrl
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
    throw new WeeklyRequestError('network', 'Failed to reach the weekly API endpoint.', { cause })
  }

  let rawPayload: unknown

  try {
    rawPayload = await response.json()
  } catch (cause) {
    throw new WeeklyRequestError('invalid-payload', 'Weekly API returned invalid JSON.', {
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

    throw new WeeklyRequestError(
      'api',
      publicError?.message ?? `Weekly API request failed with status ${response.status}.`,
      {
        publicError,
        status: response.status,
      },
    )
  }

  let parsedPayload: v1.WeeklyResponse

  try {
    parsedPayload = v1.parseWeeklyResponse(rawPayload)
  } catch (cause) {
    throw new WeeklyRequestError('invalid-payload', 'Weekly API payload does not match the public contract.', {
      cause,
      status: response.status,
    })
  }

  return parsedPayload
}
