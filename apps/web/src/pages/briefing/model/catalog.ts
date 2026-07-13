import type {
  DeepDiveAnomaly,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
} from '~/shared/api'

export type PrimaryObjectiveKind = DeepDivePrimaryObjective['kind']
export type SecondaryObjectiveKind = DeepDiveSecondaryObjective['kind']

export type Mutator =
  | {
      kind: 'anomaly'
      value: DeepDiveAnomaly
    }
  | {
      kind: 'warning'
      value: DeepDiveWarning
    }

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

type ObjectiveCatalog<Kind extends string> = {
  readonly [EntryKind in Kind]: ObjectiveCatalogEntry
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

// The single severity ladder: how much a mutator should command the reader's
// attention. Drives both the Rundown chip order and the Intel note selection —
// warnings before anomalies is a product expectation encoded by the numbers.
// Which mutators are intel-eligible is decided by the note tables in intel.ts,
// not here: a ladder entry alone does not surface an intel note.
export const mutatorSeverity = {
  HauntedCave: 10,
  LowOxygen: 20,
  DuckAndCover: 30,
  ShieldDisruption: 40,
  EliteThreat: 50,
  LethalEnemies: 60,
  MacteraPlague: 70,
  RivalPresence: 80,
  CaveLeechCluster: 90,
  ExploderInfestation: 100,
  RegenerativeBugs: 110,
  EboniteOutbreak: 120,
  PitJawColony: 130,
  ScrabNestingGrounds: 140,
  Parasites: 150,
  Swarmageddon: 160,
  BloodSugar: 210,
  VolatileGuts: 220,
  CriticalWeakness: 230,
  LowGravity: 240,
  RichAtmosphere: 250,
} satisfies Record<DeepDiveWarning | DeepDiveAnomaly, number>

export function compareMutatorSeverity(left: Mutator, right: Mutator): number {
  const severityDelta = mutatorSeverity[left.value] - mutatorSeverity[right.value]

  return severityDelta === 0 ? left.value.localeCompare(right.value) : severityDelta
}
