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

export const DEEP_DIVE_MUTATORS = [
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

export const DEEP_DIVE_DREADNOUGHTS = ['Dreadnought', 'Hiveguard', 'Twins'] as const

export type DeepDiveBiome = (typeof DEEP_DIVE_BIOMES)[number]
export type DeepDiveMutator = (typeof DEEP_DIVE_MUTATORS)[number]
export type DeepDiveWarning = (typeof DEEP_DIVE_WARNINGS)[number]
export type DeepDiveDreadnought = (typeof DEEP_DIVE_DREADNOUGHTS)[number]

export type DeepDivePrimaryObjective = Readonly<
  | { kind: 'DeepScan'; resonanceCrystals: number }
  | { kind: 'EscortDuty'; refuels: number }
  | { kind: 'MiningExpedition'; morkite: number }
  | { kind: 'IndustrialSabotage'; powerStations: number }
  | { kind: 'EggHunt'; eggs: number }
  | { kind: 'PointExtraction'; aquarqs: number }
  | { kind: 'OnSiteRefining'; morkiteWells: number }
  | { kind: 'SalvageOperation'; miniMules: number }
  | { kind: 'Elimination'; dreadnoughts: DeepDiveDreadnought[] }
  | { kind: 'HeavyExtraction'; resiniteMasses: number }
>

export type DeepDiveSecondaryObjective = Readonly<
  | { kind: 'EggHunt'; eggs: number }
  | { kind: 'DeepScan'; resonanceCrystals: number }
  | { kind: 'Blackbox'; blackBoxes: number }
  | { kind: 'Elimination'; dreadnoughts: DeepDiveDreadnought[] }
  | { kind: 'MiningExpedition'; morkite: number }
  | { kind: 'OnSiteRefining'; morkiteWells: number }
  | { kind: 'SalvageOperation'; miniMules: number }
  | { kind: 'HeavyExcavation'; resiniteMasses: number }
>

export type DeepDiveMission = Readonly<{
  primaryObjective: DeepDivePrimaryObjective
  secondaryObjective: DeepDiveSecondaryObjective
  mutator: DeepDiveMutator | null
  warning: DeepDiveWarning | null
}>

export type DeepDive = Readonly<{
  name: string
  biome: DeepDiveBiome
  missions: ReadonlyArray<DeepDiveMission>
}>

export type CurrentDeepDives = Readonly<{
  seed: number
  release: string
  expiration: string
  dives: Readonly<{
    normal: DeepDive
    elite: DeepDive
  }>
}>
