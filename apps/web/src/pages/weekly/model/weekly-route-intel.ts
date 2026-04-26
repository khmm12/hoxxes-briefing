import {
  getMutatorCatalogEntry,
  getPrimaryObjectiveCatalogEntry,
  getSecondaryObjectiveCatalogEntry,
  getWarningCatalogEntry,
  type PresentWeeklyMutator,
  type PresentWeeklyWarning,
  type WeeklyDive,
  type WeeklyEffectCatalogEntry,
  type WeeklyMission,
  type WeeklyObjectiveContextTag,
} from './weekly-route-catalog'

export type WeeklyRouteKind = 'elite' | 'normal'

export type WeeklyRouteIntelNote =
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

type WeeklyStageObjectiveContext = {
  contextTags: readonly WeeklyObjectiveContextTag[]
  primaryContextTags: readonly WeeklyObjectiveContextTag[]
}

type WeeklyRoutePriorityNote = {
  note: WeeklyRouteIntelNote
  priority: number
  stageIndex: number
}

export type WeeklyRouteIntel = {
  note: WeeklyRouteIntelNote
}

const fixedPositionTags = ['escort-anchor', 'fixed-position'] as const
const longRouteTags = ['long-travel', 'oxygen-risk', 'vertical-search'] as const
const mutatorIntelNotes = {
  BloodSugar: 'blood-sugar',
  CriticalWeakness: null,
  LowGravity: null,
  RichAtmosphere: null,
  VolatileGuts: 'volatile-guts',
} satisfies Record<PresentWeeklyMutator, WeeklyRouteIntelNote | null>

export function buildWeeklyRouteIntel(dive: WeeklyDive, kind: WeeklyRouteKind): WeeklyRouteIntel {
  return {
    note: selectWeeklyRouteIntelNote(dive, kind),
  }
}

function collectWeeklyPriorityNotes(dive: WeeklyDive): WeeklyRoutePriorityNote[] {
  return dive.missions.flatMap((mission, stageIndex): WeeklyRoutePriorityNote[] => {
    const stageContext = buildStageObjectiveContext(mission)

    return [
      collectWeeklyWarningPriorityNote(mission.warning, stageContext, stageIndex),
      collectWeeklyMutatorPriorityNote(mission.mutator, stageIndex),
    ].filter((note): note is WeeklyRoutePriorityNote => note != null)
  })
}

function collectWeeklyWarningPriorityNote(
  warning: PresentWeeklyWarning | null,
  stageContext: WeeklyStageObjectiveContext,
  stageIndex: number,
): WeeklyRoutePriorityNote | null {
  if (warning == null) {
    return null
  }

  return buildWeeklyRoutePriorityNote(
    selectWarningIntelNote(warning, stageContext),
    getWarningCatalogEntry(warning),
    stageIndex,
  )
}

function collectWeeklyMutatorPriorityNote(
  mutator: PresentWeeklyMutator | null,
  stageIndex: number,
): WeeklyRoutePriorityNote | null {
  if (mutator == null) {
    return null
  }

  const note = mutatorIntelNotes[mutator]

  if (note == null) {
    return null
  }

  return buildWeeklyRoutePriorityNote(note, getMutatorCatalogEntry(mutator), stageIndex)
}

function buildWeeklyRoutePriorityNote(
  note: WeeklyRouteIntelNote,
  effect: WeeklyEffectCatalogEntry,
  stageIndex: number,
): WeeklyRoutePriorityNote {
  if (effect.intelPriority == null) {
    throw new Error(`Weekly route intel note "${note}" requires intelPriority`)
  }

  return {
    note,
    priority: effect.intelPriority,
    stageIndex,
  }
}

function buildStageObjectiveContext(mission: WeeklyMission): WeeklyStageObjectiveContext {
  const primary = getPrimaryObjectiveCatalogEntry(mission.primaryObjective.kind)
  const secondary = getSecondaryObjectiveCatalogEntry(mission.secondaryObjective.kind)

  return {
    contextTags: uniqueTags([...primary.contextTags, ...secondary.contextTags]),
    primaryContextTags: primary.contextTags,
  }
}

function selectWeeklyRouteIntelNote(dive: WeeklyDive, kind: WeeklyRouteKind): WeeklyRouteIntelNote {
  const priorityNote = collectWeeklyPriorityNotes(dive).sort(compareWeeklyRoutePriorityNotes)[0]

  if (priorityNote != null) {
    return priorityNote.note
  }

  if (hasMutator(dive, 'CriticalWeakness')) {
    return 'favorable-critical-weakness'
  }

  if (hasMutator(dive, 'LowGravity') || hasMutator(dive, 'RichAtmosphere')) {
    return 'favorable-mobility'
  }

  if (dive.missions.some((mission) => hasAnyContextTag(buildStageObjectiveContext(mission), fixedPositionTags))) {
    return 'fixed-objective'
  }

  return kind === 'elite' ? 'clean-elite' : 'clean-normal'
}

function selectWarningIntelNote(
  warning: PresentWeeklyWarning,
  context: WeeklyStageObjectiveContext,
): WeeklyRouteIntelNote {
  switch (warning) {
    case 'HauntedCave':
      return 'haunted-cave'
    case 'DuckAndCover':
      return hasAnyContextTag(context, fixedPositionTags) ? 'duck-and-cover-fixed' : 'duck-and-cover'
    case 'LowOxygen':
      return hasPrimaryAnyContextTag(context, longRouteTags) ? 'low-oxygen-long-route' : 'low-oxygen'
    case 'ShieldDisruption':
      return 'shield-disruption'
    case 'EliteThreat':
      return 'elite-threat'
    case 'LethalEnemies':
      return 'lethal-enemies'
    case 'MacteraPlague':
      return 'mactera-plague'
    case 'RivalPresence':
      return 'rival-presence'
    case 'CaveLeechCluster':
      return 'cave-leech-cluster'
    case 'EboniteOutbreak':
      return 'ebonite-outbreak'
    case 'ExploderInfestation':
      return 'exploder-infestation'
    case 'Parasites':
      return 'parasites'
    case 'PitJawColony':
      return 'pit-jaw-colony'
    case 'RegenerativeBugs':
      return 'regenerative-bugs'
    case 'ScrabNestingGrounds':
      return 'scrab-nesting-grounds'
    case 'Swarmageddon':
      return 'swarmageddon'
  }

  return assertNever(warning)
}

function compareWeeklyRoutePriorityNotes(left: WeeklyRoutePriorityNote, right: WeeklyRoutePriorityNote): number {
  const priorityDelta = left.priority - right.priority

  return priorityDelta === 0 ? left.stageIndex - right.stageIndex : priorityDelta
}

function hasMutator(dive: WeeklyDive, mutator: PresentWeeklyMutator): boolean {
  return dive.missions.some((mission) => mission.mutator === mutator)
}

function hasAnyContextTag(context: WeeklyStageObjectiveContext, tags: readonly WeeklyObjectiveContextTag[]): boolean {
  return tags.some((tag) => context.contextTags.includes(tag))
}

function hasPrimaryAnyContextTag(
  context: WeeklyStageObjectiveContext,
  tags: readonly WeeklyObjectiveContextTag[],
): boolean {
  return tags.some((tag) => context.primaryContextTags.includes(tag))
}

function uniqueTags(tags: readonly WeeklyObjectiveContextTag[]): WeeklyObjectiveContextTag[] {
  return [...new Set(tags)]
}

function assertNever(value: never): never {
  throw new Error(`Unexpected weekly route intel value: ${String(value)}`)
}
