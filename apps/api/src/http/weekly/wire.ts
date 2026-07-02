// CLEANUP(stage-4): the legacy /api/v1/weekly wire schema — delete with the endpoint.
// Moved out of packages/contracts (ADR 0002 made contracts current-only); the
// legacy wire lives next to its anti-corruption layer until sunset (ADR 0001).
import * as v from 'valibot'

const isoTimestampSchema = /* @__PURE__ */ v.pipe(v.string(), v.isoTimestamp())

const weekSeedSchema = /* @__PURE__ */ v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xffffffff))

const weekIdentitySchema = /* @__PURE__ */ v.pipe(
  v.object({
    id: v.pipe(v.string(), v.minLength(1)),
    seed: weekSeedSchema,
    release: isoTimestampSchema,
    expiration: isoTimestampSchema,
  }),
  v.readonly(),
)

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

const deepDiveMutatorSchema = /* @__PURE__ */ v.picklist([
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

const deepDiveDreadnoughtSchema = /* @__PURE__ */ v.picklist(['Dreadnought', 'Hiveguard', 'Twins'] as const)

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
      kind: v.literal('HeavyExcavation'),
      resiniteMasses: objectiveCountSchema,
    }),
  ]),
  v.readonly(),
)

const deepDiveMissionSchema = /* @__PURE__ */ v.pipe(
  v.object({
    primaryObjective: deepDivePrimaryObjectiveSchema,
    secondaryObjective: deepDiveSecondaryObjectiveSchema,
    mutator: v.nullable(deepDiveMutatorSchema),
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

export const weeklyResponseSchema = /* @__PURE__ */ v.pipe(
  v.object({
    week: weekIdentitySchema,
    dives: v.object({
      normal: deepDiveSchema,
      elite: deepDiveSchema,
    }),
  }),
  v.readonly(),
)

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

// The legacy wire error vocabulary, absorbed from contracts with the schema.
const weeklyErrorCodeSchema = /* @__PURE__ */ v.picklist([
  'UPSTREAM_UNAVAILABLE',
  'WEEKLY_DATA_UNAVAILABLE',
  'INVALID_RESPONSE_PAYLOAD',
  'INTERNAL_ERROR',
] as const)

export const weeklyErrorResponseSchema = /* @__PURE__ */ v.pipe(
  v.object({
    code: weeklyErrorCodeSchema,
    message: v.pipe(v.string(), v.minLength(1)),
    requestId: v.optional(v.string()),
  }),
  v.readonly(),
)

export type WeeklyErrorResponse = v.InferOutput<typeof weeklyErrorResponseSchema>

export const parseWeeklyResponse = (input: unknown): WeeklyResponse => v.parse(weeklyResponseSchema, input)

export const parseWeeklyErrorResponse = (input: unknown): WeeklyErrorResponse =>
  v.parse(weeklyErrorResponseSchema, input)
