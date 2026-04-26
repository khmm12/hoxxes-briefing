import * as v from 'valibot'

const isoTimestampSchema = v.pipe(v.string(), v.isoTimestamp())

const weekSeedSchema = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(4294967295))

const weekIdentitySchema = v.strictObject({
  id: v.pipe(v.string(), v.minLength(1)),
  seed: weekSeedSchema,
  release: isoTimestampSchema,
  expiration: isoTimestampSchema,
})

const deepDiveBiomeSchema = v.picklist([
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
] as const)

const deepDiveMutatorSchema = v.picklist([
  'VolatileGuts',
  'RichAtmosphere',
  'CriticalWeakness',
  'BloodSugar',
  'LowGravity',
] as const)

const deepDiveWarningSchema = v.picklist([
  'RegenerativeBugs',
  'EliteThreat',
  'MacteraPlague',
  'EboniteOutbreak',
  'DuckAndCover',
  'CaveLeechCluster',
  'LowOxygen',
  'ExploderInfestation',
  'HauntedCave',
  'LethalEnemies',
  'ShieldDisruption',
  'Parasites',
  'Swarmageddon',
  'RivalPresence',
  'PitJawColony',
  'ScrabNestingGrounds',
] as const)

const deepDiveDreadnoughtSchema = v.picklist(['Dreadnought', 'Hiveguard', 'Twins'] as const)

const objectiveCountSchema = v.pipe(v.number(), v.integer(), v.minValue(0))

const deepDivePrimaryObjectiveSchema = v.variant('kind', [
  v.strictObject({
    kind: v.literal('DeepScan'),
    resonanceCrystals: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('EscortDuty'),
    refuels: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('MiningExpedition'),
    morkite: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('IndustrialSabotage'),
    powerStations: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('EggHunt'),
    eggs: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('PointExtraction'),
    aquarqs: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('OnSiteRefining'),
    morkiteWells: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('SalvageOperation'),
    miniMules: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('Elimination'),
    dreadnoughts: v.array(deepDiveDreadnoughtSchema),
  }),
  v.strictObject({
    kind: v.literal('HeavyExtraction'),
    resiniteMasses: objectiveCountSchema,
  }),
])

const deepDiveSecondaryObjectiveSchema = v.variant('kind', [
  v.strictObject({
    kind: v.literal('EggHunt'),
    eggs: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('DeepScan'),
    resonanceCrystals: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('Blackbox'),
    blackBoxes: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('Elimination'),
    dreadnoughts: v.array(deepDiveDreadnoughtSchema),
  }),
  v.strictObject({
    kind: v.literal('MiningExpedition'),
    morkite: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('OnSiteRefining'),
    morkiteWells: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('SalvageOperation'),
    miniMules: objectiveCountSchema,
  }),
  v.strictObject({
    kind: v.literal('HeavyExcavation'),
    resiniteMasses: objectiveCountSchema,
  }),
])

const deepDiveMissionSchema = v.strictObject({
  primaryObjective: deepDivePrimaryObjectiveSchema,
  secondaryObjective: deepDiveSecondaryObjectiveSchema,
  mutator: v.nullable(deepDiveMutatorSchema),
  warning: v.nullable(deepDiveWarningSchema),
})

const deepDiveSchema = v.strictObject({
  name: v.pipe(v.string(), v.minLength(1)),
  biome: deepDiveBiomeSchema,
  missions: v.pipe(v.array(deepDiveMissionSchema), v.minLength(3), v.maxLength(3)),
})

export const weeklyResponseSchema = v.strictObject({
  week: weekIdentitySchema,
  dives: v.strictObject({
    normal: deepDiveSchema,
    elite: deepDiveSchema,
  }),
})

export type WeekIdentity = v.InferOutput<typeof weekIdentitySchema>
export type DeepDiveBiome = v.InferOutput<typeof deepDiveBiomeSchema>
export type DeepDiveMutator = v.InferOutput<typeof deepDiveMutatorSchema>
export type DeepDiveWarning = v.InferOutput<typeof deepDiveWarningSchema>
export type DeepDiveDreadnought = v.InferOutput<typeof deepDiveDreadnoughtSchema>
export type DeepDivePrimaryObjective = v.InferOutput<typeof deepDivePrimaryObjectiveSchema>
export type DeepDiveSecondaryObjective = v.InferOutput<typeof deepDiveSecondaryObjectiveSchema>
export type DeepDiveMission = v.InferOutput<typeof deepDiveMissionSchema>
export type DeepDive = v.InferOutput<typeof deepDiveSchema>
export type WeeklyResponse = v.InferOutput<typeof weeklyResponseSchema>
