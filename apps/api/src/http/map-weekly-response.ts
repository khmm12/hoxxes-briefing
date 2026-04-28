import { type ApiV1WeeklyResponse, parseApiV1WeeklyResponse } from '@hoxxes-briefing/contracts/api/v1'
import type { CurrentDeepDives } from '../application/models/current-deep-dives.ts'
import { getIsoWeekId } from '../shared/get-iso-week-id.ts'

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
