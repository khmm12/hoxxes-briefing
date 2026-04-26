/* tslint:disable */
/* eslint-disable */
export type DeepDivePrimaryObjective = { kind: "DeepScan"; resonanceCrystals: number } | { kind: "EscortDuty"; refuels: number } | { kind: "MiningExpedition"; morkite: number } | { kind: "IndustrialSabotage"; powerStations: number } | { kind: "EggHunt"; eggs: number } | { kind: "PointExtraction"; aquarqs: number } | { kind: "OnSiteRefining"; morkiteWells: number } | { kind: "SalvageOperation"; miniMules: number } | { kind: "Elimination"; dreadnoughts: number; dreadnoughtKinds: Dreadnought[] } | { kind: "HeavyExtraction"; resiniteMasses: number };

export type DeepDiveSecondaryObjective = { kind: "Blackbox"; blackBoxes: number } | { kind: "DeepScan"; resonanceCrystals: number } | { kind: "EggHunt"; eggs: number } | { kind: "Elimination"; dreadnoughts: number; dreadnoughtKinds: Dreadnought[] } | { kind: "HeavyExcavation"; resiniteMasses: number } | { kind: "MiningExpedition"; morkite: number } | { kind: "OnSiteRefining"; morkiteWells: number } | { kind: "SalvageOperation"; miniMules: number };

export type Dreadnought = "Dreadnought" | "Hiveguard" | "Twins";


export enum Biome {
    CrystallineCaverns = 0,
    FungusBogs = 1,
    MagmaCore = 2,
    RadioactiveExclusionZone = 3,
    DenseBiozone = 4,
    SandblastedCorridors = 5,
    SaltPits = 6,
    GlacialStrata = 7,
    AzureWeald = 8,
    HollowBough = 9,
    OssuaryDepths = 10,
}

export enum Complexity {
    Simple = 0,
    Average = 1,
    Complex = 2,
}

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

export class DeepDive {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly missions: DeepDiveMission[];
    readonly biome: Biome;
    readonly name: string;
}

export class DeepDiveMission {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly primaryObjective: DeepDivePrimaryObjective;
    readonly secondaryObjective: DeepDiveSecondaryObjective;
    readonly complexity: Complexity;
    readonly duration: Duration;
    readonly mutator: DeepDiveMutator | undefined;
    readonly warning: DeepDiveWarning | undefined;
}

export enum DeepDiveMutator {
    BloodSugar = 0,
    CriticalWeakness = 1,
    LowGravity = 2,
    RichAtmosphere = 3,
    VolatileGuts = 4,
}

export class DeepDiveResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly elite: DeepDive;
    readonly normal: DeepDive;
    readonly seed: Seed;
}

export enum DeepDiveWarning {
    CaveLeechCluster = 0,
    DuckAndCover = 1,
    EboniteOutbreak = 2,
    EliteThreat = 3,
    ExploderInfestation = 4,
    HauntedCave = 5,
    LethalEnemies = 6,
    LowOxygen = 7,
    MacteraPlague = 8,
    Parasites = 9,
    PitJawColony = 10,
    RegenerativeBugs = 11,
    RivalPresence = 12,
    ScrabNestingGrounds = 13,
    ShieldDisruption = 14,
    Swarmageddon = 15,
}

export enum Duration {
    Short = 0,
    Normal = 1,
    Long = 2,
}

export class Seed {
    free(): void;
    [Symbol.dispose](): void;
    constructor(s: number);
    readonly value: number;
}

export function generate(seed: Seed): DeepDiveResult;
