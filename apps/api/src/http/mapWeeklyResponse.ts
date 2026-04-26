import { type ApiV1WeeklyResponse, parseApiV1WeeklyResponse } from '@hoxxes-briefing/contracts/api/v1'
import type { CurrentDeepDives } from '../application/models/currentDeepDives.ts'

const getIsoWeekId = (releaseTimestamp: string): string => {
  const releaseDate = new Date(releaseTimestamp)
  const calendarDate = new Date(
    Date.UTC(releaseDate.getUTCFullYear(), releaseDate.getUTCMonth(), releaseDate.getUTCDate()),
  )
  const dayOfWeek = calendarDate.getUTCDay() || 7

  calendarDate.setUTCDate(calendarDate.getUTCDate() + 4 - dayOfWeek)
  const isoYear = calendarDate.getUTCFullYear()
  const startOfIsoYear = new Date(Date.UTC(isoYear, 0, 1))
  const elapsedDays = Math.floor((calendarDate.getTime() - startOfIsoYear.getTime()) / (24 * 60 * 60 * 1000))
  const isoWeek = Math.ceil((elapsedDays + 1) / 7)

  return `${isoYear}-W${isoWeek.toString().padStart(2, '0')}`
}

export const mapCurrentDeepDivesToWeeklyResponse = (currentDeepDives: CurrentDeepDives): ApiV1WeeklyResponse => {
  return parseApiV1WeeklyResponse({
    week: {
      id: getIsoWeekId(currentDeepDives.expiration),
      seed: currentDeepDives.seed,
      release: currentDeepDives.release,
      expiration: currentDeepDives.expiration,
    },
    dives: currentDeepDives.dives,
  })
}
