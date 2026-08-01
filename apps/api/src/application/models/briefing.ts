export const DEEP_DIVE_BIOMES = [
  'CrystallineCaverns',
  'FungusBogs',
  'MagmaCore',
  'RadioactiveExclusionZone',
  'DenseBiozone',
  'SandblastedCorridors',
  'SaltPits',
  'GlacialStrata',
  'AzureWeald',
  'HollowBough',
  'OssuaryDepths',
] as const

export const DEEP_DIVE_ANOMALIES = [
  'BloodSugar',
  'CriticalWeakness',
  'LowGravity',
  'RichAtmosphere',
  'VolatileGuts',
] as const

export const DEEP_DIVE_WARNINGS = [
  'CaveLeechCluster',
  'DuckAndCover',
  'EboniteOutbreak',
  'EliteThreat',
  'ExploderInfestation',
  'HauntedCave',
  'LethalEnemies',
  'LowOxygen',
  'MacteraPlague',
  'Parasites',
  'PitJawColony',
  'RegenerativeBugs',
  'RivalPresence',
  'ScrabNestingGrounds',
  'ShieldDisruption',
  'Swarmageddon',
] as const

export const DEEP_DIVE_DREADNOUGHTS = ['Classic', 'Hiveguard', 'Twins'] as const

type DeepDiveBiome = (typeof DEEP_DIVE_BIOMES)[number]
type DeepDiveAnomaly = (typeof DEEP_DIVE_ANOMALIES)[number]
type DeepDiveWarning = (typeof DEEP_DIVE_WARNINGS)[number]
export type DeepDiveDreadnought = (typeof DEEP_DIVE_DREADNOUGHTS)[number]
export type DeepDiveDreadnoughts = readonly [DeepDiveDreadnought, ...DeepDiveDreadnought[]]

export type DeepDivePrimaryObjective = Readonly<
  | { kind: 'DeepScan'; resonanceCrystals: number }
  | { kind: 'EscortDuty'; refuels: number }
  | { kind: 'MiningExpedition'; morkite: number }
  | { kind: 'IndustrialSabotage'; powerStations: number }
  | { kind: 'EggHunt'; eggs: number }
  | { kind: 'PointExtraction'; aquarqs: number }
  | { kind: 'OnSiteRefining'; morkiteWells: number }
  | { kind: 'SalvageOperation'; miniMules: number }
  | { kind: 'Elimination'; dreadnoughts: DeepDiveDreadnoughts }
  | { kind: 'HeavyExtraction'; resiniteMasses: number }
>

export type DeepDiveSecondaryObjective = Readonly<
  | { kind: 'EggHunt'; eggs: number }
  | { kind: 'DeepScan'; resonanceCrystals: number }
  | { kind: 'Blackbox'; blackBoxes: number }
  | { kind: 'Elimination'; dreadnoughts: DeepDiveDreadnoughts }
  | { kind: 'MiningExpedition'; morkite: number }
  | { kind: 'OnSiteRefining'; morkiteWells: number }
  | { kind: 'SalvageOperation'; miniMules: number }
  | { kind: 'HeavyExtraction'; resiniteMasses: number }
>

export type DeepDiveMission = Readonly<{
  primaryObjective: DeepDivePrimaryObjective
  secondaryObjective: DeepDiveSecondaryObjective
  anomaly: DeepDiveAnomaly | null
  warning: DeepDiveWarning | null
}>

export type DeepDiveMissions = readonly [DeepDiveMission, DeepDiveMission, DeepDiveMission]

export type DeepDive = Readonly<{
  name: string
  biome: DeepDiveBiome
  missions: DeepDiveMissions
}>

export type Briefing = Readonly<{
  seed: number
  release: string
  expiration: string
  dives: Readonly<{
    normal: DeepDive
    elite: DeepDive
  }>
}>
