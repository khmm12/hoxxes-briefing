import * as v from 'valibot'
import { type BriefingResponse, briefingResponseSchema } from '../schema/briefing.ts'
import { type PublicError as ErrorResponse, publicErrorSchema as errorResponseSchema } from '../schema/error.ts'
import { type WeeklyResponse, weeklyResponseSchema } from '../schema/weekly.ts'

export type { BriefingResponse, ErrorResponse, WeeklyResponse }
export { briefingResponseSchema, errorResponseSchema, weeklyResponseSchema }

export const parseBriefingResponse = (input: unknown): BriefingResponse => v.parse(briefingResponseSchema, input)
export const safeParseBriefingResponse = (input: unknown) => v.safeParse(briefingResponseSchema, input)

export const parseWeeklyResponse = (input: unknown): WeeklyResponse => v.parse(weeklyResponseSchema, input)
export const safeParseWeeklyResponse = (input: unknown) => v.safeParse(weeklyResponseSchema, input)

export const parseErrorResponse = (input: unknown): ErrorResponse => v.parse(errorResponseSchema, input)
export const safeParseErrorResponse = (input: unknown) => v.safeParse(errorResponseSchema, input)
