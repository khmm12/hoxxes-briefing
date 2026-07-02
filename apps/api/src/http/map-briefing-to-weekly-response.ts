import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import type {
  Briefing,
  DeepDive,
  DeepDiveDreadnought,
  DeepDiveMission,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
} from '../application/models/briefing.ts'
import { getIsoWeekId } from '../shared/get-iso-week-id.ts'

// CLEANUP(stage-4): this entire anti-corruption layer deletes with the legacy wire.
// Anti-corruption layer: projects the clean Briefing domain onto the legacy
// `/api/v1/weekly` wire shape — re-nests the `week` envelope, and reverses the
// domain renames (`anomaly`→`mutator`, `Classic`→`Dreadnought`, secondary
// `HeavyExtraction`→`HeavyExcavation`). Disposable: delete together with the
// `/api/v1/weekly` endpoint at sunset (ADR 0001).
export function mapBriefingToWeeklyResponse(briefing: Briefing): v1.WeeklyResponse {
  return v1.parseWeeklyResponse({
    week: {
      id: getIsoWeekId(briefing.expiration),
      seed: briefing.seed,
      release: briefing.release,
      expiration: briefing.expiration,
    },
    dives: {
      normal: toLegacyDive(briefing.dives.normal),
      elite: toLegacyDive(briefing.dives.elite),
    },
  })
}

function toLegacyDive(dive: DeepDive) {
  return {
    name: dive.name,
    biome: dive.biome,
    missions: dive.missions.map(toLegacyMission),
  }
}

function toLegacyMission(mission: DeepDiveMission) {
  return {
    primaryObjective: toLegacyPrimaryObjective(mission.primaryObjective),
    secondaryObjective: toLegacySecondaryObjective(mission.secondaryObjective),
    mutator: mission.anomaly,
    warning: mission.warning,
  }
}

function toLegacyPrimaryObjective(objective: DeepDivePrimaryObjective) {
  if (objective.kind === 'Elimination') {
    return { kind: 'Elimination', dreadnoughts: objective.dreadnoughts.map(toLegacyDreadnought) }
  }

  return objective
}

function toLegacySecondaryObjective(objective: DeepDiveSecondaryObjective) {
  if (objective.kind === 'Elimination') {
    return { kind: 'Elimination', dreadnoughts: objective.dreadnoughts.map(toLegacyDreadnought) }
  }

  if (objective.kind === 'HeavyExtraction') {
    return { kind: 'HeavyExcavation', resiniteMasses: objective.resiniteMasses }
  }

  return objective
}

function toLegacyDreadnought(dreadnought: DeepDiveDreadnought): 'Dreadnought' | 'Hiveguard' | 'Twins' {
  return dreadnought === 'Classic' ? 'Dreadnought' : dreadnought
}
