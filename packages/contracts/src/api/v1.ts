import * as v from 'valibot'
import {
  type BriefingConfidence,
  type BriefingResponse,
  briefingResponseSchema,
  type DeepDive,
  type DeepDiveAnomaly,
  type DeepDiveBiome,
  type DeepDiveDreadnought,
  type DeepDiveMission,
  type DeepDivePrimaryObjective,
  type DeepDiveSecondaryObjective,
  type DeepDiveWarning,
} from '../schema/briefing.ts'
import { type PublicError as ErrorResponse, publicErrorSchema as errorResponseSchema } from '../schema/error.ts'

export { BRIEFING_CONTRACT_HEADER } from '../headers.ts'
export { CONTRACT_REV, parseContractRev } from '../revision.ts'
export type {
  BriefingConfidence,
  BriefingResponse,
  DeepDive,
  DeepDiveAnomaly,
  DeepDiveBiome,
  DeepDiveDreadnought,
  DeepDiveMission,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
  ErrorResponse,
}
export { briefingResponseSchema, errorResponseSchema }

export const parseBriefingResponse = (input: unknown): BriefingResponse => v.parse(briefingResponseSchema, input)
export const safeParseBriefingResponse = (input: unknown) => v.safeParse(briefingResponseSchema, input)

export const parseErrorResponse = (input: unknown): ErrorResponse => v.parse(errorResponseSchema, input)
export const safeParseErrorResponse = (input: unknown) => v.safeParse(errorResponseSchema, input)
