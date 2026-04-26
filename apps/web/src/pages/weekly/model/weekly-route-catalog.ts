import type { WeeklySnapshotResult } from '~/shared/api/weekly'

export type WeeklyDive = WeeklySnapshotResult['dives']['normal']
export type WeeklyMission = WeeklyDive['missions'][number]
export type WeeklyPrimaryObjective = WeeklyMission['primaryObjective']
export type WeeklySecondaryObjective = WeeklyMission['secondaryObjective']
export type PresentWeeklyWarning = NonNullable<WeeklyMission['warning']>
export type PresentWeeklyMutator = NonNullable<WeeklyMission['mutator']>
export type WeeklyPrimaryObjectiveKind = WeeklyPrimaryObjective['kind']
export type WeeklySecondaryObjectiveKind = WeeklySecondaryObjective['kind']

export type WeeklyObjectiveContextTag =
  | 'ammo-intensive'
  | 'escort-anchor'
  | 'fixed-position'
  | 'long-travel'
  | 'oxygen-risk'
  | 'ranged-exposure'
  | 'split-routing'
  | 'vertical-search'

export type WeeklyObjectiveCatalogEntry = {
  contextTags: readonly WeeklyObjectiveContextTag[]
}

export type WeeklyEffectCatalogEntry = {
  intelPriority: number | null
  quickReadPriority: number
}

type WeeklyObjectiveCatalog<Kind extends string> = {
  readonly [EntryKind in Kind]: WeeklyObjectiveCatalogEntry
}

type WeeklyEffectCatalog<Kind extends string> = {
  readonly [EntryKind in Kind]: WeeklyEffectCatalogEntry
}

export const weeklyPrimaryObjectiveCatalog = {
  DeepScan: {
    contextTags: ['long-travel', 'oxygen-risk', 'split-routing', 'vertical-search'],
  },
  EscortDuty: {
    contextTags: ['escort-anchor', 'fixed-position', 'ranged-exposure'],
  },
  MiningExpedition: {
    contextTags: ['long-travel', 'oxygen-risk', 'split-routing'],
  },
  IndustrialSabotage: {
    contextTags: ['ammo-intensive', 'fixed-position', 'ranged-exposure'],
  },
  EggHunt: {
    contextTags: ['split-routing'],
  },
  PointExtraction: {
    contextTags: ['long-travel', 'oxygen-risk', 'split-routing', 'vertical-search'],
  },
  OnSiteRefining: {
    contextTags: ['fixed-position', 'long-travel', 'split-routing'],
  },
  SalvageOperation: {
    contextTags: ['fixed-position', 'ranged-exposure'],
  },
  Elimination: {
    contextTags: ['ammo-intensive', 'ranged-exposure'],
  },
  HeavyExtraction: {
    contextTags: ['long-travel', 'split-routing'],
  },
} satisfies WeeklyObjectiveCatalog<WeeklyPrimaryObjectiveKind>

export const weeklySecondaryObjectiveCatalog = {
  EggHunt: {
    contextTags: ['split-routing'],
  },
  DeepScan: {
    contextTags: ['split-routing', 'vertical-search'],
  },
  Blackbox: {
    contextTags: ['fixed-position', 'ranged-exposure'],
  },
  Elimination: {
    contextTags: ['ammo-intensive', 'ranged-exposure'],
  },
  MiningExpedition: {
    contextTags: ['long-travel', 'split-routing'],
  },
  OnSiteRefining: {
    contextTags: ['fixed-position', 'split-routing'],
  },
  SalvageOperation: {
    contextTags: ['fixed-position', 'ranged-exposure'],
  },
  HeavyExcavation: {
    contextTags: ['long-travel', 'split-routing'],
  },
} satisfies WeeklyObjectiveCatalog<WeeklySecondaryObjectiveKind>

export const weeklyWarningCatalog = {
  HauntedCave: {
    intelPriority: 10,
    quickReadPriority: 10,
  },
  DuckAndCover: {
    intelPriority: 30,
    quickReadPriority: 30,
  },
  LowOxygen: {
    intelPriority: 20,
    quickReadPriority: 20,
  },
  ShieldDisruption: {
    intelPriority: 40,
    quickReadPriority: 40,
  },
  EliteThreat: {
    intelPriority: 50,
    quickReadPriority: 50,
  },
  LethalEnemies: {
    intelPriority: 60,
    quickReadPriority: 60,
  },
  MacteraPlague: {
    intelPriority: 70,
    quickReadPriority: 70,
  },
  RivalPresence: {
    intelPriority: 80,
    quickReadPriority: 80,
  },
  CaveLeechCluster: {
    intelPriority: 90,
    quickReadPriority: 90,
  },
  ExploderInfestation: {
    intelPriority: 100,
    quickReadPriority: 100,
  },
  RegenerativeBugs: {
    intelPriority: 110,
    quickReadPriority: 110,
  },
  EboniteOutbreak: {
    intelPriority: 120,
    quickReadPriority: 120,
  },
  PitJawColony: {
    intelPriority: 130,
    quickReadPriority: 130,
  },
  ScrabNestingGrounds: {
    intelPriority: 140,
    quickReadPriority: 140,
  },
  Parasites: {
    intelPriority: 150,
    quickReadPriority: 150,
  },
  Swarmageddon: {
    intelPriority: 160,
    quickReadPriority: 160,
  },
} satisfies WeeklyEffectCatalog<PresentWeeklyWarning>

export const weeklyMutatorCatalog = {
  BloodSugar: {
    intelPriority: 210,
    quickReadPriority: 210,
  },
  VolatileGuts: {
    intelPriority: 220,
    quickReadPriority: 220,
  },
  CriticalWeakness: {
    intelPriority: null,
    quickReadPriority: 230,
  },
  LowGravity: {
    intelPriority: null,
    quickReadPriority: 240,
  },
  RichAtmosphere: {
    intelPriority: null,
    quickReadPriority: 250,
  },
} satisfies WeeklyEffectCatalog<PresentWeeklyMutator>

export function getPrimaryObjectiveCatalogEntry(
  kind: WeeklyPrimaryObjectiveKind,
): (typeof weeklyPrimaryObjectiveCatalog)[WeeklyPrimaryObjectiveKind] {
  return weeklyPrimaryObjectiveCatalog[kind]
}

export function getSecondaryObjectiveCatalogEntry(
  kind: WeeklySecondaryObjectiveKind,
): (typeof weeklySecondaryObjectiveCatalog)[WeeklySecondaryObjectiveKind] {
  return weeklySecondaryObjectiveCatalog[kind]
}

export function getWarningCatalogEntry(warning: PresentWeeklyWarning): WeeklyEffectCatalogEntry {
  return weeklyWarningCatalog[warning]
}

export function getMutatorCatalogEntry(mutator: PresentWeeklyMutator): WeeklyEffectCatalogEntry {
  return weeklyMutatorCatalog[mutator]
}

export function compareWeeklyWarningsForQuickRead(left: PresentWeeklyWarning, right: PresentWeeklyWarning): number {
  return compareWeeklyEffectsForQuickRead(left, weeklyWarningCatalog[left], right, weeklyWarningCatalog[right])
}

export function compareWeeklyMutatorsForQuickRead(left: PresentWeeklyMutator, right: PresentWeeklyMutator): number {
  return compareWeeklyEffectsForQuickRead(left, weeklyMutatorCatalog[left], right, weeklyMutatorCatalog[right])
}

function compareWeeklyEffectsForQuickRead(
  leftKind: string,
  left: Pick<WeeklyEffectCatalogEntry, 'quickReadPriority'>,
  rightKind: string,
  right: Pick<WeeklyEffectCatalogEntry, 'quickReadPriority'>,
): number {
  const priorityDelta = left.quickReadPriority - right.quickReadPriority

  return priorityDelta === 0 ? leftKind.localeCompare(rightKind) : priorityDelta
}
