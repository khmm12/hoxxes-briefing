import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import type { Briefing } from '../application/models/briefing.ts'
import { getIsoWeekId } from '../shared/get-iso-week-id.ts'

export function mapBriefingToWeeklyResponse(briefing: Briefing): v1.WeeklyResponse {
  return v1.parseWeeklyResponse({
    week: {
      id: getIsoWeekId(briefing.expiration),
      seed: briefing.seed,
      release: briefing.release,
      expiration: briefing.expiration,
    },
    dives: briefing.dives,
  })
}
