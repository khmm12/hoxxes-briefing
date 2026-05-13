import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import type { CurrentDeepDives } from '../application/models/current-deep-dives.ts'
import { getIsoWeekId } from '../shared/get-iso-week-id.ts'

export function mapCurrentDeepDivesToWeeklyResponse(currentDeepDives: CurrentDeepDives): v1.WeeklyResponse {
  return v1.parseWeeklyResponse({
    week: {
      id: getIsoWeekId(currentDeepDives.expiration),
      seed: currentDeepDives.seed,
      release: currentDeepDives.release,
      expiration: currentDeepDives.expiration,
    },
    dives: currentDeepDives.dives,
  })
}
