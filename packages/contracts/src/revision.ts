import * as v from 'valibot'

// Contract revision negotiated via the X-Briefing-Contract header (ADR 0002).
// Bump only when clients below it would misread or fail to parse the current
// wire shape; every bump must transform or retire (see docs/contract-runbook.md).
export const CONTRACT_REV = 1

// A revision on the wire is a bare non-negative decimal integer — the regex
// shuts the `Number()` coercion holes ('' → 0, '0x10', '1e2', '1.0').
const contractRevSchema = /* @__PURE__ */ v.pipe(v.string(), v.regex(/^\d+$/), v.transform(Number), v.safeInteger())

// Decodes an X-Briefing-Contract header value. Client and server must agree
// on what counts as a valid revision, so the rule lives with the contract;
// anything invalid reads as "no revision sent".
export function parseContractRev(header: string | null | undefined): number | null {
  if (header == null) return null

  const result = v.safeParse(contractRevSchema, header)
  return result.success ? result.output : null
}
