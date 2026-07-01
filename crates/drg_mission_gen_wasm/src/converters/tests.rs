use super::*;

#[test]
fn converter_error_maps_unexpected_primary_objective() {
    assert_eq!(
        converter_error_type(facade::ConverterError::UnexpectedDeepDivePrimaryObjective(
            "bogus"
        )),
        "UnexpectedDeepDivePrimaryObjective"
    );
}

#[test]
fn converter_error_maps_unexpected_secondary_objective() {
    assert_eq!(
        converter_error_type(facade::ConverterError::UnexpectedDeepDiveSecondaryObjective("bogus")),
        "UnexpectedDeepDiveSecondaryObjective"
    );
}

#[test]
fn converter_error_maps_secondary_objectives_count_mismatch() {
    assert_eq!(
        converter_error_type(facade::ConverterError::SecondaryObjectivesCountMismatch { count: 2 }),
        "SecondaryObjectivesCountMismatch"
    );
}

#[test]
fn converter_error_maps_unexpected_mutator() {
    assert_eq!(
        converter_error_type(facade::ConverterError::UnexpectedDeepDiveMutator("bogus")),
        "UnexpectedDeepDiveMutator"
    );
}

#[test]
fn converter_error_maps_mutators_count_mismatch() {
    assert_eq!(
        converter_error_type(facade::ConverterError::MutatorsCountMismatch { count: 2 }),
        "MutatorsCountMismatch"
    );
}

#[test]
fn converter_error_maps_unexpected_warning() {
    assert_eq!(
        converter_error_type(facade::ConverterError::UnexpectedDeepDiveWarning("bogus")),
        "UnexpectedDeepDiveWarning"
    );
}

#[test]
fn converter_error_maps_warnings_count_mismatch() {
    assert_eq!(
        converter_error_type(facade::ConverterError::WarningsCountMismatch { count: 2 }),
        "WarningsCountMismatch"
    );
}

#[test]
fn converter_error_maps_missions_count_mismatch() {
    assert_eq!(
        converter_error_type(facade::ConverterError::MissionsCountMismatch { count: 4 }),
        "MissionsCountMismatch"
    );
}

#[test]
fn converter_error_preserves_display_message() {
    let error =
        wasm::ConverterError::from(facade::ConverterError::MissionsCountMismatch { count: 4 });
    assert_eq!(
        error.message,
        "only expected to have 3 missions, but was given 4"
    );
}

#[test]
fn deep_dive_result_converts_seed_and_both_dives() {
    let normal = facade::DeepDive {
        name: "Normal Dive".to_string(),
        biome: facade::Biome::MagmaCore,
        missions: facade::DeepDiveMissions([sample_mission(), sample_mission(), sample_mission()]),
    };
    let elite = facade::DeepDive {
        name: "Elite Dive".to_string(),
        biome: facade::Biome::SaltPits,
        missions: facade::DeepDiveMissions([sample_mission(), sample_mission(), sample_mission()]),
    };
    let result = facade::DeepDiveResult {
        seed: facade::Seed::new(42),
        normal,
        elite,
    };

    let converted = wasm::WeeklyDeepDives::from(result);

    assert_eq!(converted.seed, 42);
    assert_eq!(converted.dives.normal.name, "Normal Dive");
    assert_eq!(converted.dives.elite.name, "Elite Dive");
}

#[test]
fn deep_dive_converts_name_biome_and_missions() {
    let dive = facade::DeepDive {
        name: "Point Extraction Site".to_string(),
        biome: facade::Biome::HollowBough,
        missions: facade::DeepDiveMissions([sample_mission(), sample_mission(), sample_mission()]),
    };

    let converted = wasm::DeepDive::from(dive);

    assert_eq!(converted.name, "Point Extraction Site");
    assert_eq!(converted.biome, wasm::Biome::HollowBough);
    assert_eq!(converted.missions.len(), 3);
}

#[test]
fn mission_converts_all_fields_when_present() {
    let mission = facade::DeepDiveMission {
        primary_objective: facade::DeepDivePrimaryObjective::MiningExpedition { morkite: 250 },
        secondary_objective: facade::DeepDiveSecondaryObjective::Blackbox { black_boxes: 2 },
        mutator: Some(facade::DeepDiveMutator::LowGravity),
        warning: Some(facade::DeepDiveWarning::Swarmageddon),
        complexity: facade::Complexity::Average,
        duration: facade::Duration::Normal,
    };

    let converted = wasm::DeepDiveMission::from(mission);

    assert_eq!(
        converted.primary_objective,
        wasm::DeepDivePrimaryObjective::MiningExpedition { morkite: 250 }
    );
    assert_eq!(
        converted.secondary_objective,
        wasm::DeepDiveSecondaryObjective::Blackbox { black_boxes: 2 }
    );
    assert_eq!(converted.mutator, Some(wasm::DeepDiveMutator::LowGravity));
    assert_eq!(converted.warning, Some(wasm::DeepDiveWarning::Swarmageddon));
}

#[test]
fn mission_converts_absent_mutator_and_warning_to_none() {
    let mission = sample_mission();

    let converted = wasm::DeepDiveMission::from(mission);

    assert_eq!(converted.mutator, None);
    assert_eq!(converted.warning, None);
}

#[test]
fn primary_objective_maps_deep_scan() {
    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(facade::DeepDivePrimaryObjective::DeepScan {
            resonance_crystals: 5
        }),
        wasm::DeepDivePrimaryObjective::DeepScan {
            resonance_crystals: 5
        }
    );
}

#[test]
fn primary_objective_maps_escort_duty() {
    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(facade::DeepDivePrimaryObjective::EscortDuty {
            refuels: 1
        }),
        wasm::DeepDivePrimaryObjective::EscortDuty { refuels: 1 }
    );
}

#[test]
fn primary_objective_maps_mining_expedition() {
    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(facade::DeepDivePrimaryObjective::MiningExpedition {
            morkite: 250
        }),
        wasm::DeepDivePrimaryObjective::MiningExpedition { morkite: 250 }
    );
}

#[test]
fn primary_objective_maps_industrial_sabotage() {
    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(
            facade::DeepDivePrimaryObjective::IndustrialSabotage { power_stations: 2 }
        ),
        wasm::DeepDivePrimaryObjective::IndustrialSabotage { power_stations: 2 }
    );
}

#[test]
fn primary_objective_maps_egg_hunt() {
    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(facade::DeepDivePrimaryObjective::EggHunt { eggs: 6 }),
        wasm::DeepDivePrimaryObjective::EggHunt { eggs: 6 }
    );
}

#[test]
fn primary_objective_maps_point_extraction() {
    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(facade::DeepDivePrimaryObjective::PointExtraction {
            aquarqs: 7
        }),
        wasm::DeepDivePrimaryObjective::PointExtraction { aquarqs: 7 }
    );
}

#[test]
fn primary_objective_maps_on_site_refining() {
    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(facade::DeepDivePrimaryObjective::OnSiteRefining {
            morkite_wells: 3
        }),
        wasm::DeepDivePrimaryObjective::OnSiteRefining { morkite_wells: 3 }
    );
}

#[test]
fn primary_objective_maps_salvage_operation() {
    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(facade::DeepDivePrimaryObjective::SalvageOperation {
            mini_mules: 2
        }),
        wasm::DeepDivePrimaryObjective::SalvageOperation { mini_mules: 2 }
    );
}

#[test]
fn primary_objective_elimination_maps_kinds_to_dreadnoughts_field() {
    let objective = facade::DeepDivePrimaryObjective::Elimination {
        dreadnought_kinds: vec![facade::Dreadnought::Hiveguard, facade::Dreadnought::Twins],
    };

    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(objective),
        wasm::DeepDivePrimaryObjective::Elimination {
            dreadnoughts: vec![wasm::Dreadnought::Hiveguard, wasm::Dreadnought::Twins]
        }
    );
}

#[test]
fn primary_objective_maps_heavy_extraction() {
    assert_eq!(
        wasm::DeepDivePrimaryObjective::from(facade::DeepDivePrimaryObjective::HeavyExtraction {
            resinite_masses: 3
        }),
        wasm::DeepDivePrimaryObjective::HeavyExtraction { resinite_masses: 3 }
    );
}

#[test]
fn secondary_objective_maps_egg_hunt() {
    assert_eq!(
        wasm::DeepDiveSecondaryObjective::from(facade::DeepDiveSecondaryObjective::EggHunt {
            eggs: 4
        }),
        wasm::DeepDiveSecondaryObjective::EggHunt { eggs: 4 }
    );
}

#[test]
fn secondary_objective_maps_deep_scan() {
    assert_eq!(
        wasm::DeepDiveSecondaryObjective::from(facade::DeepDiveSecondaryObjective::DeepScan {
            resonance_crystals: 3
        }),
        wasm::DeepDiveSecondaryObjective::DeepScan {
            resonance_crystals: 3
        }
    );
}

#[test]
fn secondary_objective_maps_blackbox() {
    assert_eq!(
        wasm::DeepDiveSecondaryObjective::from(facade::DeepDiveSecondaryObjective::Blackbox {
            black_boxes: 1
        }),
        wasm::DeepDiveSecondaryObjective::Blackbox { black_boxes: 1 }
    );
}

#[test]
fn secondary_objective_elimination_keeps_kinds() {
    let objective = facade::DeepDiveSecondaryObjective::Elimination {
        dreadnought_kinds: vec![facade::Dreadnought::Classic],
    };

    assert_eq!(
        wasm::DeepDiveSecondaryObjective::from(objective),
        wasm::DeepDiveSecondaryObjective::Elimination {
            dreadnought_kinds: vec![wasm::Dreadnought::Classic]
        }
    );
}

#[test]
fn secondary_objective_maps_mining_expedition() {
    assert_eq!(
        wasm::DeepDiveSecondaryObjective::from(
            facade::DeepDiveSecondaryObjective::MiningExpedition { morkite: 200 }
        ),
        wasm::DeepDiveSecondaryObjective::MiningExpedition { morkite: 200 }
    );
}

#[test]
fn secondary_objective_maps_on_site_refining() {
    assert_eq!(
        wasm::DeepDiveSecondaryObjective::from(
            facade::DeepDiveSecondaryObjective::OnSiteRefining { morkite_wells: 3 }
        ),
        wasm::DeepDiveSecondaryObjective::OnSiteRefining { morkite_wells: 3 }
    );
}

#[test]
fn secondary_objective_maps_salvage_operation() {
    assert_eq!(
        wasm::DeepDiveSecondaryObjective::from(
            facade::DeepDiveSecondaryObjective::SalvageOperation { mini_mules: 2 }
        ),
        wasm::DeepDiveSecondaryObjective::SalvageOperation { mini_mules: 2 }
    );
}

#[test]
fn secondary_objective_maps_heavy_excavation() {
    assert_eq!(
        wasm::DeepDiveSecondaryObjective::from(
            facade::DeepDiveSecondaryObjective::HeavyExcavation { resinite_masses: 3 }
        ),
        wasm::DeepDiveSecondaryObjective::HeavyExcavation { resinite_masses: 3 }
    );
}

fn converter_error_type(error: facade::ConverterError) -> String {
    wasm::ConverterError::from(error).error_type
}

fn sample_mission() -> facade::DeepDiveMission {
    facade::DeepDiveMission {
        primary_objective: facade::DeepDivePrimaryObjective::DeepScan {
            resonance_crystals: 3,
        },
        secondary_objective: facade::DeepDiveSecondaryObjective::EggHunt { eggs: 4 },
        mutator: None,
        warning: None,
        complexity: facade::Complexity::Average,
        duration: facade::Duration::Short,
    }
}
