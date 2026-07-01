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

export type ObjectiveCatalogEntry = {
  contextTags: readonly ObjectiveContextTag[]
}

export type EffectCatalogEntry = {
  intelPriority: number | null
  quickReadPriority: number
}

type ObjectiveCatalog<Kind extends string> = {
  readonly [EntryKind in Kind]: ObjectiveCatalogEntry
}

type EffectCatalog<Kind extends string> = {
  readonly [EntryKind in Kind]: EffectCatalogEntry
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
} satisfies EffectCatalog<DeepDiveWarning>

export const anomalyCatalog = {
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
} satisfies EffectCatalog<DeepDiveAnomaly>

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

export function getWarningCatalogEntry(warning: DeepDiveWarning): EffectCatalogEntry {
  return warningCatalog[warning]
}

export function getAnomalyCatalogEntry(anomaly: DeepDiveAnomaly): EffectCatalogEntry {
  return anomalyCatalog[anomaly]
}

export function compareWarningsForQuickRead(left: DeepDiveWarning, right: DeepDiveWarning): number {
  return compareEffectsForQuickRead(left, warningCatalog[left], right, warningCatalog[right])
}

export function compareAnomaliesForQuickRead(left: DeepDiveAnomaly, right: DeepDiveAnomaly): number {
  return compareEffectsForQuickRead(left, anomalyCatalog[left], right, anomalyCatalog[right])
}

function compareEffectsForQuickRead(
  leftKind: string,
  left: Pick<EffectCatalogEntry, 'quickReadPriority'>,
  rightKind: string,
  right: Pick<EffectCatalogEntry, 'quickReadPriority'>,
): number {
  const priorityDelta = left.quickReadPriority - right.quickReadPriority

  return priorityDelta === 0 ? leftKind.localeCompare(rightKind) : priorityDelta
}
