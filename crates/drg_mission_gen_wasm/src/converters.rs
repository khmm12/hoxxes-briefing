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
                facade::ConverterError::EmptyDreadnoughts => "EmptyDreadnoughts".to_string(),
            },
        }
    }
}

impl From<facade::DeepDiveResult> for wasm::GeneratedBriefing {
    fn from(result: facade::DeepDiveResult) -> Self {
        wasm::GeneratedBriefing {
            seed: result.seed.as_u32(),
            dives: wasm::DeepDives {
                normal: result.normal.into(),
                elite: result.elite.into(),
            },
        }
    }
}

impl From<facade::DeepDive> for wasm::DeepDive {
    fn from(dd: facade::DeepDive) -> Self {
        wasm::DeepDive {
            name: dd.name,
            biome: dd.biome.into(),
            missions: dd.missions.0.into_iter().map(Into::into).collect(),
        }
    }
}

impl From<facade::DeepDiveMission> for wasm::DeepDiveMission {
    fn from(mission: facade::DeepDiveMission) -> Self {
        wasm::DeepDiveMission {
            primary_objective: mission.primary_objective.into(),
            secondary_objective: mission.secondary_objective.into(),
            anomaly: mission.anomaly.map(Into::into),
            warning: mission.warning.map(Into::into),
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
            facade::DeepDivePrimaryObjective::MiningExpedition { morkite } => {
                wasm::DeepDivePrimaryObjective::MiningExpedition { morkite }
            }
            facade::DeepDivePrimaryObjective::IndustrialSabotage { power_stations } => {
                wasm::DeepDivePrimaryObjective::IndustrialSabotage { power_stations }
            }
            facade::DeepDivePrimaryObjective::EggHunt { eggs } => {
                wasm::DeepDivePrimaryObjective::EggHunt { eggs }
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
            facade::DeepDivePrimaryObjective::Elimination { dreadnoughts } => {
                wasm::DeepDivePrimaryObjective::Elimination {
                    dreadnoughts: dreadnoughts.into_iter().map(Into::into).collect(),
                }
            }
            facade::DeepDivePrimaryObjective::HeavyExtraction { resinite_masses } => {
                wasm::DeepDivePrimaryObjective::HeavyExtraction { resinite_masses }
            }
        }
    }
}

impl From<facade::DeepDiveSecondaryObjective> for wasm::DeepDiveSecondaryObjective {
    fn from(objective: facade::DeepDiveSecondaryObjective) -> Self {
        match objective {
            facade::DeepDiveSecondaryObjective::EggHunt { eggs } => {
                wasm::DeepDiveSecondaryObjective::EggHunt { eggs }
            }
            facade::DeepDiveSecondaryObjective::DeepScan { resonance_crystals } => {
                wasm::DeepDiveSecondaryObjective::DeepScan { resonance_crystals }
            }
            facade::DeepDiveSecondaryObjective::Blackbox { black_boxes } => {
                wasm::DeepDiveSecondaryObjective::Blackbox { black_boxes }
            }
            facade::DeepDiveSecondaryObjective::Elimination { dreadnoughts } => {
                wasm::DeepDiveSecondaryObjective::Elimination {
                    dreadnoughts: dreadnoughts.into_iter().map(Into::into).collect(),
                }
            }
            facade::DeepDiveSecondaryObjective::MiningExpedition { morkite } => {
                wasm::DeepDiveSecondaryObjective::MiningExpedition { morkite }
            }
            facade::DeepDiveSecondaryObjective::OnSiteRefining { morkite_wells } => {
                wasm::DeepDiveSecondaryObjective::OnSiteRefining { morkite_wells }
            }
            facade::DeepDiveSecondaryObjective::SalvageOperation { mini_mules } => {
                wasm::DeepDiveSecondaryObjective::SalvageOperation { mini_mules }
            }
            facade::DeepDiveSecondaryObjective::HeavyExtraction { resinite_masses } => {
                wasm::DeepDiveSecondaryObjective::HeavyExtraction { resinite_masses }
            }
        }
    }
}

#[cfg(test)]
mod tests;
