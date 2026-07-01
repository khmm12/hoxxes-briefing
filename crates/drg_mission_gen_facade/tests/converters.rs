use drg_mission_gen_core::{
    EBiome, EMissionDNA, EMissionTemplate, EObjective, ObjectiveInstance, UDeepDive,
    UGeneratedMission,
};
use drg_mission_gen_facade::{ConverterError, DeepDive, DeepDiveMission, DeepDiveResult, Seed};

fn mission_with_secondaries(secondaries: Vec<EObjective>) -> UGeneratedMission {
    UGeneratedMission {
        seed: 1,
        template: EMissionTemplate::MissionType_Extraction,
        biome: EBiome::BIOME_CrystalCaves,
        primary_objective: ObjectiveInstance::from_objective(EObjective::OBJ_1st_Extraction),
        secondary_objectives: secondaries
            .into_iter()
            .map(ObjectiveInstance::from_objective)
            .collect(),
        mutators: vec![],
        warnings: vec![],
        complexity_limit: None,
        duration_limit: None,
        dna: EMissionDNA::DNA_2_01,
    }
}

#[test]
fn seed_generation_returns_three_missions_per_dive() {
    let result = DeepDiveResult::from_seed(Seed::new(1)).expect("seed should generate");

    assert_eq!(result.normal.missions.0.len(), 3);
    assert_eq!(result.elite.missions.0.len(), 3);
}

#[test]
fn deep_dive_rejects_wrong_mission_count() {
    let result = DeepDive::try_from(UDeepDive {
        name: "Bad Dive".to_string(),
        biome: EBiome::BIOME_CrystalCaves,
        missions: vec![],
    });

    assert!(matches!(
        result.expect_err("expected mission count mismatch"),
        ConverterError::MissionsCountMismatch { count: 0 }
    ));
}

#[test]
fn mission_rejects_missing_secondary_objective() {
    let result = DeepDiveMission::try_from(&mission_with_secondaries(vec![]));

    assert!(matches!(
        result.expect_err("expected secondary objective mismatch"),
        ConverterError::SecondaryObjectivesCountMismatch { count: 0 }
    ));
}

#[test]
fn mission_rejects_too_many_secondary_objectives() {
    let result = DeepDiveMission::try_from(&mission_with_secondaries(vec![
        EObjective::OBJ_DD_AlienEggs,
        EObjective::OBJ_DD_DeepScan,
    ]));

    assert!(matches!(
        result.expect_err("expected secondary objective mismatch"),
        ConverterError::SecondaryObjectivesCountMismatch { count: 2 }
    ));
}

#[test]
fn mission_rejects_unsupported_primary_objective() {
    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.primary_objective = ObjectiveInstance::from_objective(EObjective::OBJ_2nd_KillFleas);

    let result = DeepDiveMission::try_from(&mission);

    assert!(matches!(
        result.expect_err("expected unsupported primary objective"),
        ConverterError::UnexpectedDeepDivePrimaryObjective(_)
    ));
}

#[test]
fn mission_rejects_unsupported_secondary_objective() {
    let mission = mission_with_secondaries(vec![EObjective::OBJ_2nd_KillFleas]);

    let result = DeepDiveMission::try_from(&mission);

    assert!(matches!(
        result.expect_err("expected unsupported secondary objective"),
        ConverterError::UnexpectedDeepDiveSecondaryObjective(_)
    ));
}

#[test]
fn mission_rejects_mutators_count_mismatch_in_pipeline() {
    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.mutators = vec![
        drg_mission_gen_core::EMissionMutator::MMUT_BloodSugar,
        drg_mission_gen_core::EMissionMutator::MMUT_LowGravity,
    ];

    let result = DeepDiveMission::try_from(&mission);

    assert!(matches!(
        result.expect_err("expected mutators count mismatch"),
        ConverterError::MutatorsCountMismatch { count: 2 }
    ));
}

#[test]
fn mission_rejects_unsupported_mutator_in_pipeline() {
    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.mutators = vec![drg_mission_gen_core::EMissionMutator::MMUT_GoldRush];

    let result = DeepDiveMission::try_from(&mission);

    assert!(matches!(
        result.expect_err("expected unsupported mutator"),
        ConverterError::UnexpectedDeepDiveMutator(_)
    ));
}

#[test]
fn mission_rejects_warnings_count_mismatch_in_pipeline() {
    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.warnings = vec![
        drg_mission_gen_core::EMissionWarning::WRN_Ghost,
        drg_mission_gen_core::EMissionWarning::WRN_NoOxygen,
    ];

    let result = DeepDiveMission::try_from(&mission);

    assert!(matches!(
        result.expect_err("expected warnings count mismatch"),
        ConverterError::WarningsCountMismatch { count: 2 }
    ));
}

#[test]
fn mission_rejects_unsupported_warning_in_pipeline() {
    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.warnings = vec![drg_mission_gen_core::EMissionWarning::WRN_Plague];

    let result = DeepDiveMission::try_from(&mission);

    assert!(matches!(
        result.expect_err("expected unsupported warning"),
        ConverterError::UnexpectedDeepDiveWarning(_)
    ));
}

#[test]
fn deep_dive_propagates_conversion_error_from_any_mission_index() {
    let good = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    let bad = mission_with_secondaries(vec![]);

    for bad_index in 0..3 {
        let mut missions = [good.clone(), good.clone(), good.clone()];
        missions[bad_index] = bad.clone();

        let result = DeepDive::try_from(UDeepDive {
            name: "Bad Dive".to_string(),
            biome: EBiome::BIOME_CrystalCaves,
            missions: missions.to_vec(),
        });

        assert!(
            matches!(
                result.expect_err("expected secondary objective mismatch"),
                ConverterError::SecondaryObjectivesCountMismatch { count: 0 }
            ),
            "expected failure to propagate from mission index {bad_index}"
        );
    }
}

#[test]
fn mission_converts_full_pipeline_with_anomaly_and_warning() {
    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.mutators = vec![drg_mission_gen_core::EMissionMutator::MMUT_BloodSugar];
    mission.warnings = vec![drg_mission_gen_core::EMissionWarning::WRN_Ghost];

    let result = DeepDiveMission::try_from(&mission).expect("mission should convert");

    assert!(result.anomaly.is_some());
    assert!(result.warning.is_some());
}

#[test]
fn seed_round_trips_through_as_u32() {
    let seed = Seed::new(42);
    assert_eq!(seed.as_u32(), 42);
}

#[test]
fn deep_dive_result_try_from_seed_matches_from_seed() {
    let seed = Seed::new(7);
    let via_try_from = DeepDiveResult::try_from(seed).expect("seed should generate");
    let via_from_seed = DeepDiveResult::from_seed(seed).expect("seed should generate");

    assert_eq!(via_try_from, via_from_seed);
}
