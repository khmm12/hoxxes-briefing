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

type FetchBriefingOptions = {
  fetch?: typeof fetch
  request?: RequestInfo | URL
  signal?: AbortSignal
}

export type Briefing = v1.BriefingResponse

// `outdated` means this bundle is older than the deployed contract (410
// CONTRACT_RETIRED, or a payload from a newer revision) — the only fix is an
// app update, never a retry.
type BriefingRequestErrorKind = 'network' | 'api' | 'invalid-payload' | 'outdated'

type BriefingRequestErrorOptions = {
  cause?: unknown
  publicError?: v1.ErrorResponse
  status?: number
}

export class BriefingRequestError extends Error {
  readonly kind: BriefingRequestErrorKind
  readonly status?: number
  readonly publicError?: v1.ErrorResponse

  constructor(kind: BriefingRequestErrorKind, message: string, options: BriefingRequestErrorOptions = {}) {
    super(message, options.cause == null ? undefined : { cause: options.cause })
    this.name = 'BriefingRequestError'
    this.kind = kind
    this.status = options.status
    this.publicError = options.publicError
  }
}

export async function fetchBriefing(options: FetchBriefingOptions): Promise<Briefing> {
  const attempt = await fetchBriefingAttempt(options)
  if (attempt.ok) return attempt.briefing

  // Server behind the client (rollback, or the ~60s post-deploy CDN stale
  // window): one quiet retry absorbs it. If the retry still fails, the plain
  // `invalid-payload` error blames our end — never an update prompt.
  const retry = await fetchBriefingAttempt(options)
  if (retry.ok) return retry.briefing

  throw retry.error
}

// The not-ok arm is returned (instead of thrown) only for the retryable
// server-behind case — every other failure throws out of the attempt.
type BriefingAttemptResult = { ok: true; briefing: Briefing } | { ok: false; error: BriefingRequestError }

async function fetchBriefingAttempt(options: FetchBriefingOptions): Promise<BriefingAttemptResult> {
  const request = options.request ?? briefingUrl
  const fetchImpl = options.fetch ?? fetch
  let response: Response

  try {
    response = await fetchImpl(request, {
      signal: options.signal,
      headers: {
        accept: 'application/json',
        [v1.BRIEFING_CONTRACT_HEADER]: String(v1.CONTRACT_REV),
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

    // CONTRACT_RETIRED: this bundle's revision fell below the server's
    // supported window — the update wall, not a transient API failure. Keyed
    // on the contract's own code, not the 410 transport status: a bare 410
    // from a proxy or CDN must not wall the user. The code is read
    // structurally rather than from the parsed envelope so a cosmetic drift
    // elsewhere in the error body cannot demote the wall to a retry screen.
    if (readErrorCode(rawPayload) === 'CONTRACT_RETIRED') {
      throw new BriefingRequestError('outdated', 'This app version is older than the supported briefing contract.', {
        publicError,
        status: response.status,
      })
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

  try {
    return { ok: true, briefing: v1.parseBriefingResponse(rawPayload) }
  } catch (cause) {
    // A payload this bundle cannot parse is classified by the revision the
    // server echoed: server ahead → honest update nudge; server behind or
    // pre-revision → retryable; same revision → a genuine bug on our end.
    const serverRev = v1.parseContractRev(response.headers.get(v1.BRIEFING_CONTRACT_HEADER))

    if (serverRev !== null && serverRev > v1.CONTRACT_REV) {
      throw new BriefingRequestError('outdated', 'The briefing payload comes from a newer contract revision.', {
        cause,
        status: response.status,
      })
    }

    const error = new BriefingRequestError(
      'invalid-payload',
      'Briefing API payload does not match the public contract.',
      {
        cause,
        status: response.status,
      },
    )

    if (serverRev === null || serverRev < v1.CONTRACT_REV) return { ok: false, error }

    throw error
  }
}

function readErrorCode(payload: unknown): unknown {
  if (typeof payload !== 'object' || payload === null) return undefined
  return (payload as { code?: unknown }).code
}
