// Compile-time contract guards. This file is never executed — node's test
// runner only picks up `*.test.ts`, not `*.test-d.ts` — but it is typechecked
// via `tsconfig.test.json`, so a failed `Expect` breaks `pnpm typecheck`.
//
// The point is the closed-domain invariant (AGENTS: "closed enums, no freeform
// string"): every picklist must infer to its exact literal union, never widen
// to `string`, and the discriminated unions must expose exactly their members.
import type * as v1 from '@hoxxes-briefing/contracts/api/v1'

// Invariant `A extends B && B extends A` equality — distinguishes a literal
// union from its `string` supertype, which a bare `extends` check would miss.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type Expect<T extends true> = T

type Kind<T> = T extends { kind: infer K } ? K : never

// Exported so it counts as used — the guards live in the type positions below,
// not in any runtime value.
export type Assertions = [
  // Closed picklists infer to their exact literal union.
  Expect<Equal<v1.BriefingConfidence, 'verified' | 'unverified'>>,
  Expect<
    Equal<
      v1.ErrorResponse['code'],
      | 'UPSTREAM_UNAVAILABLE'
      | 'BRIEFING_DATA_UNAVAILABLE'
      | 'INVALID_RESPONSE_PAYLOAD'
      | 'CONTRACT_RETIRED'
      | 'INTERNAL_ERROR'
    >
  >,
  Expect<Equal<v1.DeepDiveDreadnought, 'Classic' | 'Hiveguard' | 'Twins'>>,
  Expect<
    Equal<v1.DeepDiveAnomaly, 'VolatileGuts' | 'RichAtmosphere' | 'CriticalWeakness' | 'BloodSugar' | 'LowGravity'>
  >,
  Expect<
    Equal<
      v1.DeepDiveBiome,
      | 'CrystallineCaverns'
      | 'FungusBogs'
      | 'MagmaCore'
      | 'RadioactiveExclusionZone'
      | 'DenseBiozone'
      | 'SandblastedCorridors'
      | 'SaltPits'
      | 'GlacialStrata'
      | 'AzureWeald'
      | 'HollowBough'
      | 'OssuaryDepths'
    >
  >,
  Expect<
    Equal<
      v1.DeepDiveWarning,
      | 'RegenerativeBugs'
      | 'EliteThreat'
      | 'MacteraPlague'
      | 'EboniteOutbreak'
      | 'DuckAndCover'
      | 'CaveLeechCluster'
      | 'LowOxygen'
      | 'ExploderInfestation'
      | 'HauntedCave'
      | 'LethalEnemies'
      | 'ShieldDisruption'
      | 'Parasites'
      | 'Swarmageddon'
      | 'RivalPresence'
      | 'PitJawColony'
      | 'ScrabNestingGrounds'
    >
  >,
  // Discriminated objectives expose exactly their `kind` members.
  Expect<
    Equal<
      Kind<v1.DeepDivePrimaryObjective>,
      | 'DeepScan'
      | 'EscortDuty'
      | 'MiningExpedition'
      | 'IndustrialSabotage'
      | 'EggHunt'
      | 'PointExtraction'
      | 'OnSiteRefining'
      | 'SalvageOperation'
      | 'Elimination'
      | 'HeavyExtraction'
    >
  >,
  Expect<
    Equal<
      Kind<v1.DeepDiveSecondaryObjective>,
      | 'EggHunt'
      | 'DeepScan'
      | 'Blackbox'
      | 'Elimination'
      | 'MiningExpedition'
      | 'OnSiteRefining'
      | 'SalvageOperation'
      | 'HeavyExtraction'
    >
  >,
  // A variant narrows to its own payload; `Elimination` carries a read-only
  // non-empty dreadnought collection.
  Expect<Equal<v1.DeepDiveDreadnoughts, readonly [v1.DeepDiveDreadnought, ...v1.DeepDiveDreadnought[]]>>,
  Expect<Equal<Extract<v1.DeepDivePrimaryObjective, { kind: 'Elimination' }>['dreadnoughts'], v1.DeepDiveDreadnoughts>>,
  // Nullable modifiers survive inference and a Deep Dive exposes exactly three
  // read-only Missions.
  Expect<Equal<v1.DeepDiveMission['anomaly'], v1.DeepDiveAnomaly | null>>,
  Expect<Equal<v1.DeepDiveMissions, readonly [v1.DeepDiveMission, v1.DeepDiveMission, v1.DeepDiveMission]>>,
  Expect<Equal<v1.DeepDive['missions'], v1.DeepDiveMissions>>,
  // Parsers hand back the contract type, not `any`.
  Expect<Equal<ReturnType<typeof v1.parseBriefingResponse>, v1.BriefingResponse>>,
  Expect<Equal<ReturnType<typeof v1.parseContractRev>, number | null>>,
]
