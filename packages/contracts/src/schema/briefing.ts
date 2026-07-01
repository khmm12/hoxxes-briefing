import * as v from 'valibot'

const isoTimestampSchema = /* @__PURE__ */ v.pipe(v.string(), v.isoTimestamp())

const briefingSeedSchema = /* @__PURE__ */ v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xffffffff))

const deepDiveBiomeSchema = /* @__PURE__ */ v.picklist([
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

const deepDiveAnomalySchema = /* @__PURE__ */ v.picklist([
  'VolatileGuts',
  'RichAtmosphere',
  'CriticalWeakness',
  'BloodSugar',
  'LowGravity',
] as const)

const deepDiveWarningSchema = /* @__PURE__ */ v.picklist([
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

const deepDiveDreadnoughtSchema = /* @__PURE__ */ v.picklist(['Classic', 'Hiveguard', 'Twins'] as const)

const objectiveCountSchema = /* @__PURE__ */ v.pipe(v.number(), v.integer(), v.minValue(0))

const deepDivePrimaryObjectiveSchema = /* @__PURE__ */ v.pipe(
  v.variant('kind', [
    v.object({
      kind: v.literal('DeepScan'),
      resonanceCrystals: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('EscortDuty'),
      refuels: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('MiningExpedition'),
      morkite: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('IndustrialSabotage'),
      powerStations: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('EggHunt'),
      eggs: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('PointExtraction'),
      aquarqs: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('OnSiteRefining'),
      morkiteWells: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('SalvageOperation'),
      miniMules: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('Elimination'),
      dreadnoughts: v.array(deepDiveDreadnoughtSchema),
    }),
    v.object({
      kind: v.literal('HeavyExtraction'),
      resiniteMasses: objectiveCountSchema,
    }),
  ]),
  v.readonly(),
)

const deepDiveSecondaryObjectiveSchema = /* @__PURE__ */ v.pipe(
  v.variant('kind', [
    v.object({
      kind: v.literal('EggHunt'),
      eggs: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('DeepScan'),
      resonanceCrystals: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('Blackbox'),
      blackBoxes: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('Elimination'),
      dreadnoughts: v.array(deepDiveDreadnoughtSchema),
    }),
    v.object({
      kind: v.literal('MiningExpedition'),
      morkite: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('OnSiteRefining'),
      morkiteWells: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('SalvageOperation'),
      miniMules: objectiveCountSchema,
    }),
    v.object({
      kind: v.literal('HeavyExtraction'),
      resiniteMasses: objectiveCountSchema,
    }),
  ]),
  v.readonly(),
)

const deepDiveMissionSchema = /* @__PURE__ */ v.pipe(
  v.object({
    primaryObjective: deepDivePrimaryObjectiveSchema,
    secondaryObjective: deepDiveSecondaryObjectiveSchema,
    anomaly: v.nullable(deepDiveAnomalySchema),
    warning: v.nullable(deepDiveWarningSchema),
  }),
  v.readonly(),
)

const deepDiveSchema = /* @__PURE__ */ v.pipe(
  v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    biome: deepDiveBiomeSchema,
    missions: v.pipe(v.array(deepDiveMissionSchema), v.minLength(3), v.maxLength(3)),
  }),
  v.readonly(),
)

export const briefingResponseSchema = /* @__PURE__ */ v.pipe(
  v.object({
    seed: briefingSeedSchema,
    release: isoTimestampSchema,
    expiration: isoTimestampSchema,
    dives: v.object({
      normal: deepDiveSchema,
      elite: deepDiveSchema,
    }),
  }),
  v.readonly(),
)

export type DeepDiveBiome = v.InferOutput<typeof deepDiveBiomeSchema>
export type DeepDiveAnomaly = v.InferOutput<typeof deepDiveAnomalySchema>
export type DeepDiveWarning = v.InferOutput<typeof deepDiveWarningSchema>
export type DeepDiveDreadnought = v.InferOutput<typeof deepDiveDreadnoughtSchema>
export type DeepDivePrimaryObjective = v.InferOutput<typeof deepDivePrimaryObjectiveSchema>
export type DeepDiveSecondaryObjective = v.InferOutput<typeof deepDiveSecondaryObjectiveSchema>
export type DeepDiveMission = v.InferOutput<typeof deepDiveMissionSchema>
export type DeepDive = v.InferOutput<typeof deepDiveSchema>
export type BriefingResponse = v.InferOutput<typeof briefingResponseSchema>
