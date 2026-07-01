pub const MISSION_COUNT: usize = 3;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Seed(u32);

impl Seed {
    pub fn new(s: u32) -> Self {
        Self(s)
    }

    pub fn as_u32(&self) -> u32 {
        self.0
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct DeepDiveResult {
    pub normal: DeepDive,
    pub elite: DeepDive,
    pub seed: Seed,
}

#[derive(Debug, Clone, PartialEq)]
pub struct DeepDive {
    pub name: String,
    pub biome: Biome,
    pub missions: DeepDiveMissions,
}

#[derive(Debug, Clone, PartialEq)]
pub struct DeepDiveMissions(pub [DeepDiveMission; MISSION_COUNT]);

#[derive(Debug, Clone, PartialEq)]
pub struct DeepDiveMission {
    pub primary_objective: DeepDivePrimaryObjective,
    pub secondary_objective: DeepDiveSecondaryObjective,
    pub mutator: Option<DeepDiveMutator>,
    pub warning: Option<DeepDiveWarning>,
    pub complexity: Complexity,
    pub duration: Duration,
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub enum Biome {
    AzureWeald,
    CrystallineCaverns,
    DenseBiozone,
    FungusBogs,
    GlacialStrata,
    HollowBough,
    MagmaCore,
    OssuaryDepths,
    RadioactiveExclusionZone,
    SaltPits,
    SandblastedCorridors,
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub enum Dreadnought {
    Classic,
    Hiveguard,
    Twins,
}

#[derive(Debug, Clone, PartialEq)]
pub enum DeepDivePrimaryObjective {
    DeepScan { resonance_crystals: u32 },
    EscortDuty { refuels: u32 },
    MiningExpedition { morkite: u32 },
    IndustrialSabotage { power_stations: u32 },
    EggHunt { eggs: u32 },
    PointExtraction { aquarqs: u32 },
    OnSiteRefining { morkite_wells: u32 },
    SalvageOperation { mini_mules: u32 },
    Elimination { dreadnought_kinds: Vec<Dreadnought> },
    HeavyExtraction { resinite_masses: u32 },
}

#[derive(Debug, Clone, PartialEq)]
pub enum DeepDiveSecondaryObjective {
    EggHunt { eggs: u32 },
    DeepScan { resonance_crystals: u32 },
    Blackbox { black_boxes: u32 },
    Elimination { dreadnought_kinds: Vec<Dreadnought> },
    MiningExpedition { morkite: u32 },
    OnSiteRefining { morkite_wells: u32 },
    SalvageOperation { mini_mules: u32 },
    HeavyExtraction { resinite_masses: u32 },
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub enum DeepDiveMutator {
    VolatileGuts,
    RichAtmosphere,
    CriticalWeakness,
    BloodSugar,
    LowGravity,
}

#[derive(Debug, Copy, Clone, PartialEq)]
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

#[derive(Debug, Copy, Clone, PartialEq, PartialOrd)]
pub enum Complexity {
    Simple,
    Average,
    Complex,
}

#[derive(Debug, Copy, Clone, PartialEq, PartialOrd)]
pub enum Duration {
    Short,
    Normal,
    Long,
}

impl DeepDivePrimaryObjective {
    pub(crate) fn new_deep_scan(
        duration: Duration,
        complexity: Complexity,
    ) -> DeepDivePrimaryObjective {
        match (duration, complexity) {
            (Duration::Short, Complexity::Average) => Self::DeepScan {
                resonance_crystals: 3,
            },
            (Duration::Normal, Complexity::Average) => Self::DeepScan {
                resonance_crystals: 5,
            },
            (dur, comp) => unreachable!(
                "unexpected deep scan duration/complexity combination: duration={dur:?}, complexity={comp:?}",
            ),
        }
    }

    pub(crate) fn new_escort_duty(
        duration: Duration,
        complexity: Complexity,
    ) -> DeepDivePrimaryObjective {
        match (duration, complexity) {
            (Duration::Normal, Complexity::Average) | (Duration::Normal, Complexity::Complex) => {
                Self::EscortDuty { refuels: 1 }
            }
            (Duration::Long, Complexity::Average) | (Duration::Long, Complexity::Complex) => {
                Self::EscortDuty { refuels: 2 }
            }
            (dur, comp) => unreachable!(
                "unexpected escort duty duration/complexity combination: duration={dur:?}, complexity={comp:?}",
            ),
        }
    }

    pub(crate) fn new_mining_expedition(
        duration: Duration,
        complexity: Complexity,
    ) -> DeepDivePrimaryObjective {
        match (duration, complexity) {
            (Duration::Short, Complexity::Simple) => Self::MiningExpedition { morkite: 200 },
            (Duration::Normal, Complexity::Simple) => Self::MiningExpedition { morkite: 225 },
            (Duration::Normal, Complexity::Average) => Self::MiningExpedition { morkite: 250 },
            (Duration::Long, Complexity::Average) => Self::MiningExpedition { morkite: 325 },
            (Duration::Long, Complexity::Complex) => Self::MiningExpedition { morkite: 400 },
            (dur, comp) => unreachable!(
                "unexpected mining expedition duration/complexity combination: duration={dur:?}, complexity={comp:?}",
            ),
        }
    }

    pub(crate) fn new_industrial_sabotage(_: Duration, _: Complexity) -> DeepDivePrimaryObjective {
        DeepDivePrimaryObjective::IndustrialSabotage { power_stations: 2 }
    }

    pub(crate) fn new_egg_hunt(
        duration: Duration,
        complexity: Complexity,
    ) -> DeepDivePrimaryObjective {
        match (duration, complexity) {
            (Duration::Short, Complexity::Simple) => Self::EggHunt { eggs: 4 },
            (Duration::Normal, Complexity::Average) => Self::EggHunt { eggs: 6 },
            (Duration::Long, Complexity::Average) => Self::EggHunt { eggs: 8 },
            (dur, comp) => unreachable!(
                "unexpected egg hunt duration/complexity combination: duration={dur:?}, complexity={comp:?}",
            ),
        }
    }

    pub(crate) fn new_point_extraction(
        duration: Duration,
        complexity: Complexity,
    ) -> DeepDivePrimaryObjective {
        match (duration, complexity) {
            (Duration::Normal, Complexity::Complex) => Self::PointExtraction { aquarqs: 7 },
            (Duration::Long, Complexity::Complex) => Self::PointExtraction { aquarqs: 10 },
            (dur, comp) => unreachable!(
                "unexpected point extraction duration/complexity combination: duration={dur:?}, complexity={comp:?}",
            ),
        }
    }

    pub(crate) fn new_on_site_refining(_: Duration, _: Complexity) -> DeepDivePrimaryObjective {
        DeepDivePrimaryObjective::OnSiteRefining { morkite_wells: 3 }
    }

    pub(crate) fn new_salvage_operation(
        duration: Duration,
        complexity: Complexity,
    ) -> DeepDivePrimaryObjective {
        match (duration, complexity) {
            (Duration::Normal, Complexity::Average) => Self::SalvageOperation { mini_mules: 2 },
            (Duration::Long, Complexity::Complex) => Self::SalvageOperation { mini_mules: 3 },
            (dur, comp) => unreachable!(
                "unexpected salvage operation duration/complexity combination: duration={dur:?}, complexity={comp:?}",
            ),
        }
    }

    pub(crate) fn new_heavy_extraction(
        duration: Duration,
        complexity: Complexity,
    ) -> DeepDivePrimaryObjective {
        match (duration, complexity) {
            (Duration::Normal, Complexity::Average) | (Duration::Normal, Complexity::Complex) => {
                Self::HeavyExtraction { resinite_masses: 3 }
            }
            (Duration::Long, Complexity::Average) | (Duration::Long, Complexity::Complex) => {
                Self::HeavyExtraction { resinite_masses: 4 }
            }
            (dur, comp) => unreachable!(
                "unexpected heavy extraction duration/complexity combination: duration={dur:?}, complexity={comp:?}",
            ),
        }
    }
}

#[cfg(test)]
mod tests;
