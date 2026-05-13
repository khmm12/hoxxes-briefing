import * as v from 'valibot'
import { type PublicError as ErrorResponse, publicErrorSchema as errorResponseSchema } from '../schema/error.ts'
import { type WeeklyResponse, weeklyResponseSchema } from '../schema/weekly.ts'

export type { ErrorResponse, WeeklyResponse }
export { errorResponseSchema, weeklyResponseSchema }

export const parseWeeklyResponse = (input: unknown): WeeklyResponse => v.parse(weeklyResponseSchema, input)
export const safeParseWeeklyResponse = (input: unknown) => v.safeParse(weeklyResponseSchema, input)

export const parseErrorResponse = (input: unknown): ErrorResponse => v.parse(errorResponseSchema, input)
export const safeParseErrorResponse = (input: unknown) => v.safeParse(errorResponseSchema, input)
