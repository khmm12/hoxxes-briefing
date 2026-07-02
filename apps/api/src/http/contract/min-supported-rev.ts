// Server-only floor of the supported revision window (ADR 0002). Raising it
// retires revisions: clients below it get 410 CONTRACT_RETIRED (the update
// wall). Check the logged client-revision distribution before raising.
export const MIN_SUPPORTED_REV = 1
