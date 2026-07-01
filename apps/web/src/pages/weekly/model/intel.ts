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
} from './weekly-catalog'

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
  contextTags: readonly WeeklyObjectiveContextTag[]
  primaryContextTags: readonly WeeklyObjectiveContextTag[]
}

type PriorityNote = {
  note: IntelNote
  priority: number
  stageIndex: number
}

export type Intel = {
  note: IntelNote
}

const fixedPositionTags = ['escort-anchor', 'fixed-position'] as const
const longRouteTags = ['long-travel', 'oxygen-risk', 'vertical-search'] as const
const mutatorIntelNotes = {
  BloodSugar: 'blood-sugar',
  CriticalWeakness: null,
  LowGravity: null,
  RichAtmosphere: null,
  VolatileGuts: 'volatile-guts',
} satisfies Record<PresentWeeklyMutator, IntelNote | null>

export function buildIntel(dive: WeeklyDive, kind: DiveKind): Intel {
  return {
    note: selectIntelNote(dive, kind),
  }
}

function collectPriorityNotes(dive: WeeklyDive): PriorityNote[] {
  return dive.missions.flatMap((mission, stageIndex): PriorityNote[] => {
    const stageContext = buildStageObjectiveContext(mission)

    return [
      collectWarningPriorityNote(mission.warning, stageContext, stageIndex),
      collectMutatorPriorityNote(mission.mutator, stageIndex),
    ].filter((note): note is PriorityNote => note != null)
  })
}

function collectWarningPriorityNote(
  warning: PresentWeeklyWarning | null,
  stageContext: StageObjectiveContext,
  stageIndex: number,
): PriorityNote | null {
  if (warning == null) {
    return null
  }

  return buildPriorityNote(selectWarningIntelNote(warning, stageContext), getWarningCatalogEntry(warning), stageIndex)
}

function collectMutatorPriorityNote(mutator: PresentWeeklyMutator | null, stageIndex: number): PriorityNote | null {
  if (mutator == null) {
    return null
  }

  const note = mutatorIntelNotes[mutator]

  if (note == null) {
    return null
  }

  return buildPriorityNote(note, getMutatorCatalogEntry(mutator), stageIndex)
}

function buildPriorityNote(note: IntelNote, effect: WeeklyEffectCatalogEntry, stageIndex: number): PriorityNote {
  if (effect.intelPriority == null) {
    throw new Error(`Intel note "${note}" requires intelPriority`)
  }

  return {
    note,
    priority: effect.intelPriority,
    stageIndex,
  }
}

function buildStageObjectiveContext(mission: WeeklyMission): StageObjectiveContext {
  const primary = getPrimaryObjectiveCatalogEntry(mission.primaryObjective.kind)
  const secondary = getSecondaryObjectiveCatalogEntry(mission.secondaryObjective.kind)

  return {
    contextTags: uniqueTags([...primary.contextTags, ...secondary.contextTags]),
    primaryContextTags: primary.contextTags,
  }
}

function selectIntelNote(dive: WeeklyDive, kind: DiveKind): IntelNote {
  const priorityNote = collectPriorityNotes(dive).sort(comparePriorityNotes)[0]

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

function selectWarningIntelNote(warning: PresentWeeklyWarning, context: StageObjectiveContext): IntelNote {
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

function comparePriorityNotes(left: PriorityNote, right: PriorityNote): number {
  const priorityDelta = left.priority - right.priority

  return priorityDelta === 0 ? left.stageIndex - right.stageIndex : priorityDelta
}

function hasMutator(dive: WeeklyDive, mutator: PresentWeeklyMutator): boolean {
  return dive.missions.some((mission) => mission.mutator === mutator)
}

function hasAnyContextTag(context: StageObjectiveContext, tags: readonly WeeklyObjectiveContextTag[]): boolean {
  return tags.some((tag) => context.contextTags.includes(tag))
}

function hasPrimaryAnyContextTag(context: StageObjectiveContext, tags: readonly WeeklyObjectiveContextTag[]): boolean {
  return tags.some((tag) => context.primaryContextTags.includes(tag))
}

function uniqueTags(tags: readonly WeeklyObjectiveContextTag[]): WeeklyObjectiveContextTag[] {
  return [...new Set(tags)]
}

function assertNever(value: never): never {
  throw new Error(`Unexpected intel value: ${String(value)}`)
}
