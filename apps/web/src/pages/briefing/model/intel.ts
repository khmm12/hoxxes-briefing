import type { DeepDive, DeepDiveAnomaly, DeepDiveMission, DeepDiveWarning } from '~/shared/api'
import {
  mutatorSeverity,
  type ObjectiveContextTag,
  primaryObjectiveCatalog,
  secondaryObjectiveCatalog,
} from './catalog'

export type DiveKind = 'elite' | 'normal'

export type IntelNote =
  | 'blood-sugar'
  | 'cave-leech-cluster'
  | 'clean-elite'
  | 'clean-normal'
  | 'duck-and-cover'
  | 'duck-and-cover-fixed'
  | 'ebonite-outbreak'
  | 'elite-threat'
  | 'exploder-infestation'
  | 'favorable-critical-weakness'
  | 'favorable-mobility'
  | 'fixed-objective'
  | 'haunted-cave'
  | 'lethal-enemies'
  | 'low-oxygen'
  | 'low-oxygen-long-route'
  | 'mactera-plague'
  | 'parasites'
  | 'pit-jaw-colony'
  | 'regenerative-bugs'
  | 'rival-presence'
  | 'scrab-nesting-grounds'
  | 'shield-disruption'
  | 'swarmageddon'
  | 'volatile-guts'

type StageObjectiveContext = {
  contextTags: readonly ObjectiveContextTag[]
  primaryContextTags: readonly ObjectiveContextTag[]
}

type PriorityNote = {
  note: IntelNote
  priority: number
  stageIndex: number
}

type AnomalyIntel = {
  stance: 'pressure' | 'favorable'
  note: IntelNote
}

const fixedPositionTags = ['escort-anchor', 'fixed-position'] as const
const longRouteTags = ['long-travel', 'oxygen-risk', 'vertical-search'] as const

const warningIntelNotes = {
  HauntedCave: 'haunted-cave',
  LowOxygen: 'low-oxygen',
  DuckAndCover: 'duck-and-cover',
  ShieldDisruption: 'shield-disruption',
  EliteThreat: 'elite-threat',
  LethalEnemies: 'lethal-enemies',
  MacteraPlague: 'mactera-plague',
  RivalPresence: 'rival-presence',
  CaveLeechCluster: 'cave-leech-cluster',
  ExploderInfestation: 'exploder-infestation',
  RegenerativeBugs: 'regenerative-bugs',
  EboniteOutbreak: 'ebonite-outbreak',
  PitJawColony: 'pit-jaw-colony',
  ScrabNestingGrounds: 'scrab-nesting-grounds',
  Parasites: 'parasites',
  Swarmageddon: 'swarmageddon',
} satisfies Record<DeepDiveWarning, IntelNote>

const anomalyIntel = {
  BloodSugar: { stance: 'pressure', note: 'blood-sugar' },
  VolatileGuts: { stance: 'pressure', note: 'volatile-guts' },
  CriticalWeakness: { stance: 'favorable', note: 'favorable-critical-weakness' },
  LowGravity: { stance: 'favorable', note: 'favorable-mobility' },
  RichAtmosphere: { stance: 'favorable', note: 'favorable-mobility' },
} satisfies Record<DeepDiveAnomaly, AnomalyIntel>

export function buildIntel(dive: DeepDive, kind: DiveKind): IntelNote {
  const priorityNote = collectPriorityNotes(dive).sort(comparePriorityNotes)[0]
  if (priorityNote != null) return priorityNote.note

  const favorableNote = selectFavorableAnomalyNote(dive)
  if (favorableNote != null) return favorableNote

  if (hasFixedObjective(dive)) return 'fixed-objective'

  return kind === 'elite' ? 'clean-elite' : 'clean-normal'
}

function collectPriorityNotes(dive: DeepDive): PriorityNote[] {
  return dive.missions.flatMap((mission, stageIndex): PriorityNote[] => {
    const stageContext = buildStageObjectiveContext(mission)

    return [
      collectWarningPriorityNote(mission.warning, stageContext, stageIndex),
      collectAnomalyPriorityNote(mission.anomaly, stageIndex),
    ].filter((note): note is PriorityNote => note != null)
  })
}

function collectWarningPriorityNote(
  warning: DeepDiveWarning | null,
  stageContext: StageObjectiveContext,
  stageIndex: number,
): PriorityNote | null {
  if (warning == null) {
    return null
  }

  return {
    note: selectWarningIntelNote(warning, stageContext),
    priority: mutatorSeverity[warning],
    stageIndex,
  }
}

function collectAnomalyPriorityNote(anomaly: DeepDiveAnomaly | null, stageIndex: number): PriorityNote | null {
  if (anomaly == null) {
    return null
  }

  const intel = anomalyIntel[anomaly]

  if (intel.stance !== 'pressure') {
    return null
  }

  return {
    note: intel.note,
    priority: mutatorSeverity[anomaly],
    stageIndex,
  }
}

// The most severe favorable anomaly wins; the severity ladder deliberately
// decides this precedence too, not a hardcoded chain.
function selectFavorableAnomalyNote(dive: DeepDive): IntelNote | null {
  const favorable = dive.missions
    .map((mission) => mission.anomaly)
    .filter((anomaly): anomaly is DeepDiveAnomaly => anomaly != null && anomalyIntel[anomaly].stance === 'favorable')
    .sort((left, right) => mutatorSeverity[left] - mutatorSeverity[right])[0]

  return favorable != null ? anomalyIntel[favorable].note : null
}

function buildStageObjectiveContext(mission: DeepDiveMission): StageObjectiveContext {
  const primary = primaryObjectiveCatalog[mission.primaryObjective.kind]
  const secondary = secondaryObjectiveCatalog[mission.secondaryObjective.kind]

  return {
    contextTags: uniqueTags([...primary.contextTags, ...secondary.contextTags]),
    primaryContextTags: primary.contextTags,
  }
}

function selectWarningIntelNote(warning: DeepDiveWarning, context: StageObjectiveContext): IntelNote {
  switch (warning) {
    case 'DuckAndCover':
      return hasAnyTag(context.contextTags, fixedPositionTags) ? 'duck-and-cover-fixed' : 'duck-and-cover'
    case 'LowOxygen':
      return hasAnyTag(context.primaryContextTags, longRouteTags) ? 'low-oxygen-long-route' : 'low-oxygen'
    default:
      return warningIntelNotes[warning]
  }
}

function comparePriorityNotes(left: PriorityNote, right: PriorityNote): number {
  const priorityDelta = left.priority - right.priority

  return priorityDelta === 0 ? left.stageIndex - right.stageIndex : priorityDelta
}

function hasFixedObjective(dive: DeepDive): boolean {
  return dive.missions.some((mission) => hasAnyTag(buildStageObjectiveContext(mission).contextTags, fixedPositionTags))
}

function hasAnyTag(source: readonly ObjectiveContextTag[], tags: readonly ObjectiveContextTag[]): boolean {
  return tags.some((tag) => source.includes(tag))
}

function uniqueTags(tags: readonly ObjectiveContextTag[]): ObjectiveContextTag[] {
  return [...new Set(tags)]
}
