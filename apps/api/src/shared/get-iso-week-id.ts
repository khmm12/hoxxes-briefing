import { utc } from '@date-fns/utc'
import { getISOWeek, getISOWeekYear } from 'date-fns'

export function getIsoWeekId(releaseTimestamp: string): string {
  const releaseDate = new Date(releaseTimestamp)

  const year = getISOWeekYear(releaseDate, { in: utc }).toString()
  const week = getISOWeek(releaseDate, { in: utc }).toString()

  return `${year}-W${week.padStart(2, '0')}`
}
