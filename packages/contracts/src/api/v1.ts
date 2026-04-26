import * as v from 'valibot'
import { type PublicError, publicErrorSchema } from '../schema/error.ts'
import { type WeeklyResponse, weeklyResponseSchema } from '../schema/weekly.ts'

export const apiV1WeeklyResponseSchema = weeklyResponseSchema
export const apiV1ErrorResponseSchema = publicErrorSchema

export type ApiV1WeeklyResponse = WeeklyResponse
export type ApiV1ErrorResponse = PublicError

export const parseApiV1WeeklyResponse = (input: unknown): ApiV1WeeklyResponse =>
  v.parse(apiV1WeeklyResponseSchema, input)

export const parseApiV1ErrorResponse = (input: unknown): ApiV1ErrorResponse => v.parse(apiV1ErrorResponseSchema, input)

export const safeParseApiV1WeeklyResponse = (input: unknown) => v.safeParse(apiV1WeeklyResponseSchema, input)

export const safeParseApiV1ErrorResponse = (input: unknown) => v.safeParse(apiV1ErrorResponseSchema, input)

export const assertApiV1WeeklyResponse = (input: unknown): asserts input is ApiV1WeeklyResponse => {
  v.parse(apiV1WeeklyResponseSchema, input)
}

export const assertApiV1ErrorResponse = (input: unknown): asserts input is ApiV1ErrorResponse => {
  v.parse(apiV1ErrorResponseSchema, input)
}

export const apiV1 = {
  schema: {
    weekly: apiV1WeeklyResponseSchema,
    error: apiV1ErrorResponseSchema,
  },
  parse: {
    weekly: parseApiV1WeeklyResponse,
    error: parseApiV1ErrorResponse,
  },
  safeParse: {
    weekly: safeParseApiV1WeeklyResponse,
    error: safeParseApiV1ErrorResponse,
  },
  assert: {
    weekly: assertApiV1WeeklyResponse,
    error: assertApiV1ErrorResponse,
  },
} as const
