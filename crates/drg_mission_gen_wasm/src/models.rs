use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq)]
#[wasm_bindgen(getter_with_clone, inspectable)]
pub struct ConverterError {
    #[wasm_bindgen(readonly)]
    pub message: String,

    #[wasm_bindgen(readonly, js_name = "type")]
    pub error_type: String,
}

#[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::tsify::Tsify)]
#[serde(rename_all = "camelCase")]
pub struct WeeklyDeepDives {
    pub seed: u32,
    pub dives: DeepDives,
}

#[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::tsify::Tsify)]
#[serde(rename_all = "camelCase")]
pub struct DeepDives {
    pub normal: DeepDive,
    pub elite: DeepDive,
}

#[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::tsify::Tsify)]
#[serde(rename_all = "camelCase")]
pub struct DeepDive {
    pub name: String,
    pub biome: Biome,
    pub missions: Vec<DeepDiveMission>,
}

#[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::tsify::Tsify)]
#[serde(rename_all = "camelCase")]
pub struct DeepDiveMission {
    pub primary_objective: DeepDivePrimaryObjective,
    pub secondary_objective: DeepDiveSecondaryObjective,
    pub mutator: Option<DeepDiveMutator>,
    pub warning: Option<DeepDiveWarning>,
}

wasm_string_enum! {
    pub enum Biome {
        CrystallineCaverns,
        FungusBogs,
        MagmaCore,
        RadioactiveExclusionZone,
        DenseBiozone,
        SandblastedCorridors,
        SaltPits,
        GlacialStrata,
        AzureWeald,
        HollowBough,
        OssuaryDepths,
    }

    from drg_mission_gen_facade::Biome
}

#[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::tsify::Tsify)]
#[serde(tag = "kind")]
pub enum DeepDivePrimaryObjective {
    #[serde(rename_all = "camelCase")]
    DeepScan { resonance_crystals: u32 },
    #[serde(rename_all = "camelCase")]
    EscortDuty { refuels: u32 },
    #[serde(rename_all = "camelCase")]
    MiningExpedition { morkite: u32 },
    #[serde(rename_all = "camelCase")]
    IndustrialSabotage { power_stations: u32 },
    #[serde(rename_all = "camelCase")]
    EggHunt { eggs: u32 },
    #[serde(rename_all = "camelCase")]
    PointExtraction { aquarqs: u32 },
    #[serde(rename_all = "camelCase")]
    OnSiteRefining { morkite_wells: u32 },
    #[serde(rename_all = "camelCase")]
    SalvageOperation { mini_mules: u32 },
    #[serde(rename_all = "camelCase")]
    Elimination { dreadnoughts: Vec<Dreadnought> },
    #[serde(rename_all = "camelCase")]
    HeavyExtraction { resinite_masses: u32 },
}

#[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::tsify::Tsify)]
#[serde(tag = "kind")]
pub enum DeepDiveSecondaryObjective {
    #[serde(rename_all = "camelCase")]
    Blackbox { black_boxes: u32 },
    #[serde(rename_all = "camelCase")]
    DeepScan { resonance_crystals: u32 },
    #[serde(rename_all = "camelCase")]
    EggHunt { eggs: u32 },
    #[serde(rename_all = "camelCase")]
    Elimination {
        #[serde(rename = "dreadnoughts")]
        dreadnought_kinds: Vec<Dreadnought>,
    },
    // Domain name is `HeavyExtraction` (ubiquitous language, see
    // docs/domain.md); the wire tag stays "HeavyExcavation" for backward
    // compat with shipped payloads and warm client caches.
    // TODO: align the TS contract on `HeavyExtraction` and flip the wire
    // (drop this rename) once a cache-busting deploy is acceptable.
    #[serde(rename = "HeavyExcavation", rename_all = "camelCase")]
    HeavyExtraction { resinite_masses: u32 },
    #[serde(rename_all = "camelCase")]
    MiningExpedition { morkite: u32 },
    #[serde(rename_all = "camelCase")]
    OnSiteRefining { morkite_wells: u32 },
    #[serde(rename_all = "camelCase")]
    SalvageOperation { mini_mules: u32 },
}

wasm_string_enum! {
    pub enum DeepDiveMutator {
        BloodSugar,
        CriticalWeakness,
        LowGravity,
        RichAtmosphere,
        VolatileGuts,
    }

    from drg_mission_gen_facade::DeepDiveMutator
}

wasm_string_enum! {
    pub enum DeepDiveWarning {
        CaveLeechCluster,
        DuckAndCover,
        EboniteOutbreak,
        EliteThreat,
        ExploderInfestation,
        HauntedCave,
        LethalEnemies,
        LowOxygen,
        MacteraPlague,
        Parasites,
        PitJawColony,
        RegenerativeBugs,
        RivalPresence,
        ScrabNestingGrounds,
        ShieldDisruption,
        Swarmageddon,
    }

    from drg_mission_gen_facade::DeepDiveWarning
}

wasm_string_enum! {
    pub enum Dreadnought {
        // Domain name is `Classic` (ubiquitous language, see docs/domain.md);
        // the wire tag stays "Dreadnought" for backward compat with shipped
        // payloads and warm client caches.
        // TODO: align the TS contract on `Classic` and flip the wire (drop this
        // rename) once a cache-busting deploy is acceptable.
        #[serde(rename = "Dreadnought")]
        Classic,
        Hiveguard,
        Twins,
    }

    from drg_mission_gen_facade::Dreadnought
}

#[cfg(test)]
mod tests;
