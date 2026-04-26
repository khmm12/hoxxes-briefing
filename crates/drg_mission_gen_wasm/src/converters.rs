use crate::models as wasm;

use drg_mission_gen_facade as facade;

impl From<facade::ConverterError> for wasm::ConverterError {
    fn from(error: facade::ConverterError) -> Self {
        wasm::ConverterError {
            message: error.to_string(),
            error_type: match error {
                facade::ConverterError::UnexpectedDeepDivePrimaryObjective(..) => {
                    "UnexpectedDeepDivePrimaryObjective".to_string()
                }
                facade::ConverterError::UnexpectedDeepDiveSecondaryObjective(..) => {
                    "UnexpectedDeepDiveSecondaryObjective".to_string()
                }
                facade::ConverterError::SecondaryObjectivesCountMismatch { .. } => {
                    "SecondaryObjectivesCountMismatch".to_string()
                }
                facade::ConverterError::UnexpectedDeepDiveMutator(..) => {
                    "UnexpectedDeepDiveMutator".to_string()
                }
                facade::ConverterError::MutatorsCountMismatch { .. } => {
                    "MutatorsCountMismatch".to_string()
                }
                facade::ConverterError::UnexpectedDeepDiveWarning(..) => {
                    "UnexpectedDeepDiveWarning".to_string()
                }
                facade::ConverterError::WarningsCountMismatch { .. } => {
                    "WarningsCountMismatch".to_string()
                }
                facade::ConverterError::MissionsCountMismatch { .. } => {
                    "MissionsCountMismatch".to_string()
                }
            },
        }
    }
}

impl From<facade::DeepDiveResult> for wasm::DeepDiveResult {
    fn from(result: facade::DeepDiveResult) -> Self {
        wasm::DeepDiveResult {
            normal: result.normal.into(),
            elite: result.elite.into(),
            seed: result.seed.into(),
        }
    }
}

impl From<facade::Seed> for wasm::Seed {
    fn from(seed: facade::Seed) -> Self {
        Self::new(seed.as_u32())
    }
}

impl From<wasm::Seed> for facade::Seed {
    fn from(seed: wasm::Seed) -> Self {
        Self::new(seed.as_u32())
    }
}

impl From<facade::DeepDive> for wasm::DeepDive {
    fn from(dd: facade::DeepDive) -> Self {
        wasm::DeepDive {
            name: dd.name,
            biome: dd.biome.into(),
            missions: dd.missions.into(),
        }
    }
}

impl From<facade::DeepDiveMissions> for wasm::DeepDiveMissions {
    fn from(missions: facade::DeepDiveMissions) -> Self {
        wasm::DeepDiveMissions(missions.0.map(|m| m.into()))
    }
}

impl From<facade::DeepDiveMission> for wasm::DeepDiveMission {
    fn from(mission: facade::DeepDiveMission) -> Self {
        wasm::DeepDiveMission {
            primary_objective: mission.primary_objective.into(),
            secondary_objective: mission.secondary_objective.into(),
            mutator: mission.mutator.map(Into::into),
            warning: mission.warning.map(Into::into),
            complexity: mission.complexity.into(),
            duration: mission.duration.into(),
        }
    }
}

impl From<facade::DeepDivePrimaryObjective> for wasm::DeepDivePrimaryObjective {
    fn from(objective: facade::DeepDivePrimaryObjective) -> Self {
        match objective {
            facade::DeepDivePrimaryObjective::DeepScan { resonance_crystals } => {
                wasm::DeepDivePrimaryObjective::DeepScan { resonance_crystals }
            }
            facade::DeepDivePrimaryObjective::EscortDuty { refuels } => {
                wasm::DeepDivePrimaryObjective::EscortDuty { refuels }
            }
            facade::DeepDivePrimaryObjective::PointExtraction { aquarqs } => {
                wasm::DeepDivePrimaryObjective::PointExtraction { aquarqs }
            }
            facade::DeepDivePrimaryObjective::OnSiteRefining { morkite_wells } => {
                wasm::DeepDivePrimaryObjective::OnSiteRefining { morkite_wells }
            }
            facade::DeepDivePrimaryObjective::SalvageOperation { mini_mules } => {
                wasm::DeepDivePrimaryObjective::SalvageOperation { mini_mules }
            }
            facade::DeepDivePrimaryObjective::Elimination {
                dreadnoughts,
                dreadnought_kinds: dreadnoughts_,
            } => wasm::DeepDivePrimaryObjective::Elimination {
                dreadnoughts,
                dreadnought_kinds: dreadnoughts_.into_iter().map(Into::into).collect(),
            },
            facade::DeepDivePrimaryObjective::HeavyExtraction { resinite_masses } => {
                wasm::DeepDivePrimaryObjective::HeavyExtraction { resinite_masses }
            }

            facade::DeepDivePrimaryObjective::MiningExpedition { morkite } => {
                wasm::DeepDivePrimaryObjective::MiningExpedition { morkite }
            }
            facade::DeepDivePrimaryObjective::IndustrialSabotage { power_stations } => {
                wasm::DeepDivePrimaryObjective::IndustrialSabotage { power_stations }
            }
            facade::DeepDivePrimaryObjective::EggHunt { eggs } => {
                wasm::DeepDivePrimaryObjective::EggHunt { eggs }
            }
        }
    }
}

impl From<facade::DeepDiveSecondaryObjective> for wasm::DeepDiveSecondaryObjective {
    fn from(obj: facade::DeepDiveSecondaryObjective) -> Self {
        use facade::DeepDiveSecondaryObjective as Obj;
        match obj {
            Obj::EggHunt { eggs } => wasm::DeepDiveSecondaryObjective::EggHunt { eggs },
            Obj::DeepScan { resonance_crystals } => {
                wasm::DeepDiveSecondaryObjective::DeepScan { resonance_crystals }
            }
            Obj::Blackbox { black_boxes } => {
                wasm::DeepDiveSecondaryObjective::Blackbox { black_boxes }
            }
            Obj::Elimination {
                dreadnoughts,
                dreadnought_kinds,
            } => wasm::DeepDiveSecondaryObjective::Elimination {
                dreadnoughts,
                dreadnought_kinds: dreadnought_kinds.into_iter().map(Into::into).collect(),
            },
            Obj::MiningExpedition { morkite } => {
                wasm::DeepDiveSecondaryObjective::MiningExpedition { morkite }
            }
            Obj::OnSiteRefining { morkite_wells } => {
                wasm::DeepDiveSecondaryObjective::OnSiteRefining { morkite_wells }
            }
            Obj::SalvageOperation { mini_mules } => {
                wasm::DeepDiveSecondaryObjective::SalvageOperation { mini_mules }
            }
            Obj::HeavyExcavation { resinite_masses: excavation_points } => {
                wasm::DeepDiveSecondaryObjective::HeavyExcavation { resinite_masses: excavation_points }
            }
        }
    }
}


impl From<facade::Dreadnought> for wasm::Dreadnought {
    fn from(mission: facade::Dreadnought) -> Self {
        match mission {
            facade::Dreadnought::Dreadnought => wasm::Dreadnought::Dreadnought,
            facade::Dreadnought::Hiveguard => wasm::Dreadnought::Hiveguard,
            facade::Dreadnought::Twins => wasm::Dreadnought::Twins,
        }
    }
}
