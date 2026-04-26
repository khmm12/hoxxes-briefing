use serde_wasm_bindgen;
use wasm_bindgen::prelude::*;

use crate::wasm_enum_with_simple_mapping;
use drg_mission_gen_facade as facade;

#[derive(Debug, Clone, PartialEq)]
#[wasm_bindgen(getter_with_clone, inspectable)]
pub struct ConverterError {
    #[wasm_bindgen(readonly)]
    pub message: String,

    #[wasm_bindgen(readonly, js_name = "type")]
    pub error_type: String,
}

#[derive(Debug, Clone, PartialEq)]
#[wasm_bindgen(getter_with_clone)]
pub struct DeepDiveResult {
    #[wasm_bindgen(readonly)]
    pub normal: DeepDive,

    #[wasm_bindgen(readonly)]
    pub elite: DeepDive,

    #[wasm_bindgen(readonly)]
    pub seed: Seed,
}

#[derive(Debug, Clone, Copy, PartialEq)]
#[wasm_bindgen]
pub struct Seed(u32);

#[wasm_bindgen]
impl Seed {
    #[wasm_bindgen(constructor)]
    pub fn new(s: u32) -> Self {
        Self(s)
    }

    #[wasm_bindgen(getter = "value")]
    pub fn as_u32(&self) -> u32 {
        self.0
    }
}

#[derive(Debug, Clone, PartialEq)]
#[wasm_bindgen(getter_with_clone)]
pub struct DeepDive {
    #[wasm_bindgen(readonly)]
    pub name: String,

    #[wasm_bindgen(readonly)]
    pub biome: Biome,

    #[wasm_bindgen(skip)]
    pub missions: DeepDiveMissions,
}

#[wasm_bindgen]
impl DeepDive {
    #[wasm_bindgen(getter)]
    pub fn missions(&self) -> Vec<DeepDiveMission> {
        self.missions.0.to_vec()
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct DeepDiveMissions(pub [DeepDiveMission; facade::MISSION_COUNT]);

#[derive(Debug, Clone, PartialEq)]
#[wasm_bindgen]
pub struct DeepDiveMission {
    #[wasm_bindgen(skip)]
    pub primary_objective: DeepDivePrimaryObjective,

    #[wasm_bindgen(skip)]
    pub secondary_objective: DeepDiveSecondaryObjective,

    #[wasm_bindgen(readonly)]
    pub mutator: Option<DeepDiveMutator>,

    #[wasm_bindgen(readonly)]
    pub warning: Option<DeepDiveWarning>,

    #[wasm_bindgen(readonly)]
    pub complexity: Complexity,

    #[wasm_bindgen(readonly)]
    pub duration: Duration,
}

#[wasm_bindgen]
impl DeepDiveMission {
    #[wasm_bindgen(getter, js_name = primaryObjective, unchecked_return_type = "DeepDivePrimaryObjective")]
    pub fn primary_objective(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.primary_objective).unwrap()
    }

    #[wasm_bindgen(getter, js_name = secondaryObjective, unchecked_return_type = "DeepDiveSecondaryObjective")]
    pub fn secondary_objective(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.secondary_objective).unwrap()
    }
}

wasm_enum_with_simple_mapping! {
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

    from facade::Biome
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
    Elimination {
        dreadnoughts: u32,
        dreadnought_kinds: Vec<Dreadnought>,
    },
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
        dreadnoughts: u32,
        dreadnought_kinds: Vec<Dreadnought>,
    },
    #[serde(rename_all = "camelCase")]
    HeavyExcavation { resinite_masses: u32 },
    #[serde(rename_all = "camelCase")]
    MiningExpedition { morkite: u32 },
    #[serde(rename_all = "camelCase")]
    OnSiteRefining { morkite_wells: u32 },
    #[serde(rename_all = "camelCase")]
    SalvageOperation { mini_mules: u32 },
}

wasm_enum_with_simple_mapping! {
    pub enum DeepDiveMutator {
        BloodSugar,
        CriticalWeakness,
        LowGravity,
        RichAtmosphere,
        VolatileGuts,
    }

    from facade::DeepDiveMutator
}

wasm_enum_with_simple_mapping! {
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

    from facade::DeepDiveWarning
}

wasm_enum_with_simple_mapping! {
    pub enum Complexity {
        Simple,
        Average,
        Complex,
    }

    from facade::Complexity
}

wasm_enum_with_simple_mapping! {
    pub enum Duration {
        Short,
        Normal,
        Long,
    }

    from facade::Duration
}

#[derive(Debug, Copy, Clone, PartialEq, ::serde::Serialize, ::tsify::Tsify)]
pub enum Dreadnought {
    Dreadnought,
    Hiveguard,
    Twins,
}

// wasm_enum_with_simple_mapping!(
//     pub enum Dreadnought {
//         Dreadnought,
//         Hiveguard,
//         Twins,
//     }

//     from facade::Dreadnought
// );
