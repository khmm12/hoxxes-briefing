import type {
  DeepDiveAnomaly,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
} from '~/shared/api'

export type PrimaryObjectiveKind = DeepDivePrimaryObjective['kind']
export type SecondaryObjectiveKind = DeepDiveSecondaryObjective['kind']

export type ObjectiveContextTag =
  | 'ammo-intensive'
  | 'escort-anchor'
  | 'fixed-position'
  | 'long-travel'
  | 'oxygen-risk'
  | 'ranged-exposure'
  | 'split-routing'
  | 'vertical-search'

type ObjectiveCatalogEntry = {
  contextTags: readonly ObjectiveContextTag[]
}

export type MutatorCatalogEntry = {
  intelPriority: number | null
  rundownPriority: number
}

type ObjectiveCatalog<Kind extends string> = {
  readonly [EntryKind in Kind]: ObjectiveCatalogEntry
}

type MutatorCatalog<Kind extends string> = {
  readonly [EntryKind in Kind]: MutatorCatalogEntry
}

export const primaryObjectiveCatalog = {
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
} satisfies ObjectiveCatalog<PrimaryObjectiveKind>

export const secondaryObjectiveCatalog = {
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
  HeavyExtraction: {
    contextTags: ['long-travel', 'split-routing'],
  },
} satisfies ObjectiveCatalog<SecondaryObjectiveKind>

export const warningCatalog = {
  HauntedCave: {
    intelPriority: 10,
    rundownPriority: 10,
  },
  DuckAndCover: {
    intelPriority: 30,
    rundownPriority: 30,
  },
  LowOxygen: {
    intelPriority: 20,
    rundownPriority: 20,
  },
  ShieldDisruption: {
    intelPriority: 40,
    rundownPriority: 40,
  },
  EliteThreat: {
    intelPriority: 50,
    rundownPriority: 50,
  },
  LethalEnemies: {
    intelPriority: 60,
    rundownPriority: 60,
  },
  MacteraPlague: {
    intelPriority: 70,
    rundownPriority: 70,
  },
  RivalPresence: {
    intelPriority: 80,
    rundownPriority: 80,
  },
  CaveLeechCluster: {
    intelPriority: 90,
    rundownPriority: 90,
  },
  ExploderInfestation: {
    intelPriority: 100,
    rundownPriority: 100,
  },
  RegenerativeBugs: {
    intelPriority: 110,
    rundownPriority: 110,
  },
  EboniteOutbreak: {
    intelPriority: 120,
    rundownPriority: 120,
  },
  PitJawColony: {
    intelPriority: 130,
    rundownPriority: 130,
  },
  ScrabNestingGrounds: {
    intelPriority: 140,
    rundownPriority: 140,
  },
  Parasites: {
    intelPriority: 150,
    rundownPriority: 150,
  },
  Swarmageddon: {
    intelPriority: 160,
    rundownPriority: 160,
  },
} satisfies MutatorCatalog<DeepDiveWarning>

export const anomalyCatalog = {
  BloodSugar: {
    intelPriority: 210,
    rundownPriority: 210,
  },
  VolatileGuts: {
    intelPriority: 220,
    rundownPriority: 220,
  },
  CriticalWeakness: {
    intelPriority: null,
    rundownPriority: 230,
  },
  LowGravity: {
    intelPriority: null,
    rundownPriority: 240,
  },
  RichAtmosphere: {
    intelPriority: null,
    rundownPriority: 250,
  },
} satisfies MutatorCatalog<DeepDiveAnomaly>

export function getPrimaryObjectiveCatalogEntry(
  kind: PrimaryObjectiveKind,
): (typeof primaryObjectiveCatalog)[PrimaryObjectiveKind] {
  return primaryObjectiveCatalog[kind]
}

export function getSecondaryObjectiveCatalogEntry(
  kind: SecondaryObjectiveKind,
): (typeof secondaryObjectiveCatalog)[SecondaryObjectiveKind] {
  return secondaryObjectiveCatalog[kind]
}

export function getWarningCatalogEntry(warning: DeepDiveWarning): MutatorCatalogEntry {
  return warningCatalog[warning]
}

export function getAnomalyCatalogEntry(anomaly: DeepDiveAnomaly): MutatorCatalogEntry {
  return anomalyCatalog[anomaly]
}

export function compareWarningsForRundown(left: DeepDiveWarning, right: DeepDiveWarning): number {
  return compareMutatorsForRundown(left, warningCatalog[left], right, warningCatalog[right])
}

export function compareAnomaliesForRundown(left: DeepDiveAnomaly, right: DeepDiveAnomaly): number {
  return compareMutatorsForRundown(left, anomalyCatalog[left], right, anomalyCatalog[right])
}

function compareMutatorsForRundown(
  leftKind: string,
  left: Pick<MutatorCatalogEntry, 'rundownPriority'>,
  rightKind: string,
  right: Pick<MutatorCatalogEntry, 'rundownPriority'>,
): number {
  const priorityDelta = left.rundownPriority - right.rundownPriority

  return priorityDelta === 0 ? leftKind.localeCompare(rightKind) : priorityDelta
}
