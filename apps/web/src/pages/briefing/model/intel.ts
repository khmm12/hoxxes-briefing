import type { DeepDive, DeepDiveDreadnought, DeepDiveDreadnoughts, DeepDiveMission } from '~/shared/api'

export type DiveKind = 'elite' | 'normal'
export type Difficulty = 'Easy' | 'Manageable' | 'Demanding' | 'Brutal'
export type CrewProfile = 'small' | 'full'
export type CrewGrades = Record<CrewProfile, Difficulty>
export type Intel = {
  overall: CrewGrades
  stages: [CrewGrades, CrewGrades, CrewGrades]
}

export function buildIntel(dive: DeepDive): Intel {
  // Both kinds currently share relative rule grades; kind never adds a Hazard bonus.
  let entry: Runway = 'Fresh'
  const stages = dive.missions.map((mission) => {
    const grade = strongest([
      ...objectivePressure(mission, entry),
      ...secondaryPressure(mission),
      ...warningPressure(mission, entry),
    ])
    entry = exitRunway(mission)
    return grade
  }) as Intel['stages']
  const overall = {
    small: median(stages.map((grade) => grade.small)),
    full: median(stages.map((grade) => grade.full)),
  }
  return { overall, stages }
}

const profiles: CrewProfile[] = ['small', 'full']
const rank: Record<Difficulty, number> = { Easy: 0, Manageable: 1, Demanding: 2, Brutal: 3 }
type Runway = 'Fresh' | 'Banked' | 'Contested'

function median(grades: Difficulty[]): Difficulty {
  return [...grades].sort((a, b) => rank[a] - rank[b])[1]
}

function strongest(causes: CrewGrades[]): CrewGrades {
  const grades: CrewGrades = { small: 'Easy', full: 'Easy' }
  for (const cause of causes) {
    for (const profile of profiles) {
      if (rank[cause[profile]] > rank[grades[profile]]) grades[profile] = cause[profile]
    }
  }
  return grades
}

function objectivePressure(mission: DeepDiveMission, entry: Runway): CrewGrades[] {
  const objective = mission.primaryObjective
  switch (objective.kind) {
    case 'MiningExpedition':
    case 'EggHunt':
    case 'DeepScan':
    case 'HeavyExtraction':
    case 'OnSiteRefining':
      return []
    case 'PointExtraction':
      return [extractionPressure(mission, entry)]
    case 'SalvageOperation':
      if (mission.anomaly === 'BloodSugar') return []
      return [
        {
          small: 'Manageable',
          full: 'Manageable',
        },
      ]
    case 'EscortDuty':
      if (mission.warning === 'DuckAndCover' || mission.warning === 'MacteraPlague') return []
      return [
        {
          small: 'Demanding',
          full: entry === 'Contested' ? 'Demanding' : 'Manageable',
        },
      ]
    case 'IndustrialSabotage':
      return [
        {
          small: 'Brutal',
          full: 'Demanding',
        },
      ]
    case 'Elimination':
      return [bossPressure(hasHiveguard(objective.dreadnoughts))]
  }
}

function bossPressure(hiveguard: boolean): CrewGrades {
  return hiveguard
    ? {
        small: 'Demanding',
        full: 'Manageable',
      }
    : {
        small: 'Manageable',
        full: 'Manageable',
      }
}

function secondaryPressure(mission: DeepDiveMission): CrewGrades[] {
  const objective = mission.secondaryObjective
  switch (objective.kind) {
    case 'MiningExpedition':
    case 'EggHunt':
    case 'DeepScan':
    case 'HeavyExtraction':
    case 'OnSiteRefining':
    case 'SalvageOperation':
      return []
    case 'Blackbox':
      if (mission.anomaly === 'BloodSugar' || mission.primaryObjective.kind === 'PointExtraction') return []
      return [
        {
          small: 'Manageable',
          full: 'Manageable',
        },
      ]
    case 'Elimination':
      // The extraction compound covers ordinary boss combat, but not Hiveguard phases.
      if (mission.primaryObjective.kind === 'PointExtraction' && !hasHiveguard(objective.dreadnoughts)) return []
      return [bossPressure(hasHiveguard(objective.dreadnoughts))]
  }
}

function extractionPressure(mission: DeepDiveMission, entry: Runway): CrewGrades {
  const secondary = mission.secondaryObjective.kind
  if (secondary === 'Elimination') {
    return {
      small: entry === 'Banked' ? 'Demanding' : 'Brutal',
      full: entry === 'Banked' ? 'Manageable' : entry === 'Contested' ? 'Brutal' : 'Demanding',
    }
  }
  if (secondary === 'Blackbox') {
    return {
      small: entry === 'Contested' ? 'Brutal' : 'Demanding',
      full: entry === 'Contested' ? 'Demanding' : 'Manageable',
    }
  }
  return {
    small:
      entry === 'Banked' || (mission.anomaly === 'RichAtmosphere' && entry !== 'Contested')
        ? 'Manageable'
        : 'Demanding',
    full: entry === 'Contested' ? 'Manageable' : 'Easy',
  }
}

function exitRunway(mission: DeepDiveMission): Runway {
  if (mission.warning === 'DuckAndCover' || mission.warning === 'HauntedCave') return 'Contested'
  switch (mission.primaryObjective.kind) {
    case 'MiningExpedition':
    case 'EggHunt':
    case 'DeepScan':
    case 'HeavyExtraction':
    case 'OnSiteRefining':
    case 'IndustrialSabotage':
      return 'Banked'
    case 'SalvageOperation':
      return mission.anomaly === 'BloodSugar' ? 'Banked' : 'Contested'
    case 'PointExtraction':
    case 'Elimination':
    case 'EscortDuty':
      return 'Contested'
  }
}

function warningPressure(mission: DeepDiveMission, entry: Runway): CrewGrades[] {
  const warning = mission.warning
  if (warning === null) return []
  switch (warning) {
    case 'EboniteOutbreak':
    case 'Parasites':
    case 'RegenerativeBugs':
      return []
    case 'HauntedCave':
      return [
        {
          small: 'Brutal',
          full: 'Demanding',
        },
      ]
    case 'DuckAndCover':
    case 'MacteraPlague':
      return rangedPressure(mission, entry, warning === 'DuckAndCover')
    case 'LowOxygen':
      return [oxygenPressure(mission, entry)]
    case 'ShieldDisruption':
      return [
        {
          small: 'Demanding',
          full: 'Demanding',
        },
      ]
    case 'CaveLeechCluster':
      return [
        {
          small: 'Demanding',
          full: 'Manageable',
        },
      ]
    case 'EliteThreat':
    case 'LethalEnemies':
    case 'RivalPresence':
    case 'ExploderInfestation':
    case 'Swarmageddon':
    case 'PitJawColony':
    case 'ScrabNestingGrounds':
      return [
        {
          small: 'Manageable',
          full: 'Manageable',
        },
      ]
  }
}

function rangedPressure(mission: DeepDiveMission, entry: Runway, duck: boolean): CrewGrades[] {
  const primary = mission.primaryObjective.kind
  const causes: CrewGrades[] = []
  if (primary === 'DeepScan') {
    causes.push({
      small: 'Brutal',
      full: 'Demanding',
    })
  }
  if (primary === 'EscortDuty') {
    causes.push({
      small: duck ? 'Brutal' : 'Demanding',
      full: duck || entry === 'Contested' ? 'Demanding' : 'Manageable',
    })
  }
  if (primary === 'PointExtraction') {
    causes.push({
      small: duck ? 'Brutal' : 'Demanding',
      full: entry === 'Contested' ? (duck ? 'Brutal' : 'Demanding') : duck ? 'Demanding' : 'Manageable',
    })
  }
  if (primary === 'SalvageOperation' || mission.secondaryObjective.kind === 'Blackbox') {
    causes.push({
      small: 'Demanding',
      full: duck ? 'Demanding' : 'Manageable',
    })
  }
  if (!causes.length)
    causes.push({
      small: duck ? 'Demanding' : 'Manageable',
      full: duck ? 'Demanding' : 'Manageable',
    })
  return causes
}

function oxygenPressure(mission: DeepDiveMission, entry: Runway): CrewGrades {
  const primary = mission.primaryObjective.kind

  if (primary === 'PointExtraction')
    return {
      small: entry === 'Banked' ? 'Demanding' : 'Brutal',
      full: entry === 'Banked' ? 'Manageable' : entry === 'Contested' ? 'Brutal' : 'Demanding',
    }
  if (primary === 'OnSiteRefining')
    return {
      small: 'Demanding',
      full: 'Demanding',
    }
  return {
    small: 'Manageable',
    full: 'Manageable',
  }
}

function hasHiveguard(dreadnoughts: DeepDiveDreadnoughts): boolean {
  const phases: Record<DeepDiveDreadnought, boolean> = { Classic: false, Twins: false, Hiveguard: true }
  return dreadnoughts.some((dreadnought) => phases[dreadnought])
}
