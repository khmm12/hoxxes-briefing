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
