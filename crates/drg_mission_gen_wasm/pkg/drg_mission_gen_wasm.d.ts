/* tslint:disable */
/* eslint-disable */
export interface DeepDive {
    name: string;
    biome: Biome;
    missions: DeepDiveMission[];
}

export interface DeepDiveMission {
    primaryObjective: DeepDivePrimaryObjective;
    secondaryObjective: DeepDiveSecondaryObjective;
    anomaly: DeepDiveAnomaly | null;
    warning: DeepDiveWarning | null;
}

export interface DeepDives {
    normal: DeepDive;
    elite: DeepDive;
}

export interface WeeklyDeepDives {
    seed: number;
    dives: DeepDives;
}

export type Biome = "CrystallineCaverns" | "FungusBogs" | "MagmaCore" | "RadioactiveExclusionZone" | "DenseBiozone" | "SandblastedCorridors" | "SaltPits" | "GlacialStrata" | "AzureWeald" | "HollowBough" | "OssuaryDepths";

export type DeepDiveAnomaly = "BloodSugar" | "CriticalWeakness" | "LowGravity" | "RichAtmosphere" | "VolatileGuts";

export type DeepDivePrimaryObjective = { kind: "DeepScan"; resonanceCrystals: number } | { kind: "EscortDuty"; refuels: number } | { kind: "MiningExpedition"; morkite: number } | { kind: "IndustrialSabotage"; powerStations: number } | { kind: "EggHunt"; eggs: number } | { kind: "PointExtraction"; aquarqs: number } | { kind: "OnSiteRefining"; morkiteWells: number } | { kind: "SalvageOperation"; miniMules: number } | { kind: "Elimination"; dreadnoughts: Dreadnought[] } | { kind: "HeavyExtraction"; resiniteMasses: number };

export type DeepDiveSecondaryObjective = { kind: "Blackbox"; blackBoxes: number } | { kind: "DeepScan"; resonanceCrystals: number } | { kind: "EggHunt"; eggs: number } | { kind: "Elimination"; dreadnoughts: Dreadnought[] } | { kind: "HeavyExtraction"; resiniteMasses: number } | { kind: "MiningExpedition"; morkite: number } | { kind: "OnSiteRefining"; morkiteWells: number } | { kind: "SalvageOperation"; miniMules: number };

export type DeepDiveWarning = "CaveLeechCluster" | "DuckAndCover" | "EboniteOutbreak" | "EliteThreat" | "ExploderInfestation" | "HauntedCave" | "LethalEnemies" | "LowOxygen" | "MacteraPlague" | "Parasites" | "PitJawColony" | "RegenerativeBugs" | "RivalPresence" | "ScrabNestingGrounds" | "ShieldDisruption" | "Swarmageddon";

export type Dreadnought = "Classic" | "Hiveguard" | "Twins";


export class ConverterError {
    private constructor();
    /**
     ** Return copy of self without private attributes.
     */
    toJSON(): Object;
    /**
     * Return stringified version of self.
     */
    toString(): string;
    free(): void;
    [Symbol.dispose](): void;
    readonly message: string;
    readonly type: string;
}

export function generate(seed: number): WeeklyDeepDives;
