use drg_mission_gen_core::{
    EBiome, EMissionDNA, EMissionMutator, EMissionTemplate, EMissionWarning, EObjective,
    ObjectiveInstance, UGeneratedMission,
};

use super::*;

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
fn mission_converts_full_pipeline() {
    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.mutators = vec![EMissionMutator::MMUT_BloodSugar];
    mission.warnings = vec![EMissionWarning::WRN_Ghost];

    let result = map_mission(&mission).unwrap();

    assert_eq!(
        result.primary_objective,
        DeepDivePrimaryObjective::MiningExpedition { morkite: 200 }
    );
    assert_eq!(
        result.secondary_objective,
        DeepDiveSecondaryObjective::EggHunt { eggs: 2 }
    );
    assert_eq!(result.anomaly, Some(DeepDiveAnomaly::BloodSugar));
    assert_eq!(result.warning, Some(DeepDiveWarning::HauntedCave));
    assert_eq!(result.complexity, Complexity::Simple);
    assert_eq!(result.duration, Duration::Short);
}

#[test]
fn mission_maps_long_duration_and_average_complexity() {
    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.dna = EMissionDNA::DNA_2_04;

    let result = map_mission(&mission).unwrap();

    assert_eq!(
        result.primary_objective,
        DeepDivePrimaryObjective::MiningExpedition { morkite: 325 }
    );
    assert_eq!(result.complexity, Complexity::Average);
    assert_eq!(result.duration, Duration::Long);
}

#[test]
fn mission_rejects_missing_or_multiple_secondary_objectives() {
    assert!(matches!(
        map_mission(&mission_with_secondaries(vec![])).unwrap_err(),
        ConverterError::SecondaryObjectivesCountMismatch { count: 0 }
    ));

    assert!(matches!(
        map_mission(&mission_with_secondaries(vec![
            EObjective::OBJ_DD_AlienEggs,
            EObjective::OBJ_DD_DeepScan,
        ]))
        .unwrap_err(),
        ConverterError::SecondaryObjectivesCountMismatch { count: 2 }
    ));
}

#[test]
fn mission_rejects_unsupported_objectives() {
    let mut invalid_primary = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    invalid_primary.primary_objective =
        ObjectiveInstance::from_objective(EObjective::OBJ_2nd_KillFleas);
    assert!(matches!(
        map_mission(&invalid_primary).unwrap_err(),
        ConverterError::UnexpectedDeepDivePrimaryObjective(_)
    ));

    let invalid_secondary = mission_with_secondaries(vec![EObjective::OBJ_2nd_KillFleas]);
    assert!(matches!(
        map_mission(&invalid_secondary).unwrap_err(),
        ConverterError::UnexpectedDeepDiveSecondaryObjective(_)
    ));
}

#[test]
fn mission_rejects_invalid_primary_objective_configuration() {
    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.primary_objective = ObjectiveInstance::from_objective(EObjective::OBJ_1st_DeepScan);

    assert!(matches!(
        map_mission(&mission).unwrap_err(),
        ConverterError::InvalidPrimaryObjectiveConfiguration {
            objective: "OBJ_1st_DeepScan",
            duration: Duration::Short,
            complexity: Complexity::Simple,
        }
    ));
}

#[test]
fn mission_maps_every_supported_anomaly() {
    let cases = [
        (
            EMissionMutator::MMUT_BloodSugar,
            DeepDiveAnomaly::BloodSugar,
        ),
        (
            EMissionMutator::MMUT_ExplosiveEnemies,
            DeepDiveAnomaly::VolatileGuts,
        ),
        (
            EMissionMutator::MMUT_LowGravity,
            DeepDiveAnomaly::LowGravity,
        ),
        (
            EMissionMutator::MMUT_OxygenRich,
            DeepDiveAnomaly::RichAtmosphere,
        ),
        (
            EMissionMutator::MMUT_Weakspot,
            DeepDiveAnomaly::CriticalWeakness,
        ),
    ];

    for (upstream, expected) in cases {
        let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
        mission.mutators = vec![upstream];

        assert_eq!(map_mission(&mission).unwrap().anomaly, Some(expected));
    }
}

#[test]
fn mission_rejects_unsupported_or_multiple_anomalies() {
    let unsupported = [
        EMissionMutator::MMUT_ExterminationContract,
        EMissionMutator::MMUT_GoldRush,
        EMissionMutator::MMUT_RichInMinerals,
        EMissionMutator::MMUT_SecretSecondary,
        EMissionMutator::MMUT_XXXP,
    ];

    for mutator in unsupported {
        let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
        mission.mutators = vec![mutator];
        assert!(matches!(
            map_mission(&mission).unwrap_err(),
            ConverterError::UnexpectedDeepDiveMutator(_)
        ));
    }

    let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    mission.mutators = vec![
        EMissionMutator::MMUT_BloodSugar,
        EMissionMutator::MMUT_LowGravity,
    ];
    assert!(matches!(
        map_mission(&mission).unwrap_err(),
        ConverterError::MutatorsCountMismatch { count: 2 }
    ));
}

#[test]
fn mission_maps_every_supported_warning() {
    let cases = [
        (
            EMissionWarning::WRN_BulletHell,
            DeepDiveWarning::DuckAndCover,
        ),
        (
            EMissionWarning::WRN_CaveLeechDen,
            DeepDiveWarning::CaveLeechCluster,
        ),
        (
            EMissionWarning::WRN_ExploderInfestation,
            DeepDiveWarning::ExploderInfestation,
        ),
        (EMissionWarning::WRN_Ghost, DeepDiveWarning::HauntedCave),
        (
            EMissionWarning::WRN_HeroEnemies,
            DeepDiveWarning::EliteThreat,
        ),
        (
            EMissionWarning::WRN_InfestedEnemies,
            DeepDiveWarning::Parasites,
        ),
        (
            EMissionWarning::WRN_LethalEnemies,
            DeepDiveWarning::LethalEnemies,
        ),
        (
            EMissionWarning::WRN_MacteraCave,
            DeepDiveWarning::MacteraPlague,
        ),
        (EMissionWarning::WRN_NoOxygen, DeepDiveWarning::LowOxygen),
        (
            EMissionWarning::WRN_NoShields,
            DeepDiveWarning::ShieldDisruption,
        ),
        (
            EMissionWarning::WRN_PitJawColony,
            DeepDiveWarning::PitJawColony,
        ),
        (
            EMissionWarning::WRN_RegenerativeEnemies,
            DeepDiveWarning::RegenerativeBugs,
        ),
        (
            EMissionWarning::WRN_RivalIncursion,
            DeepDiveWarning::RivalPresence,
        ),
        (
            EMissionWarning::WRN_RockInfestation,
            DeepDiveWarning::EboniteOutbreak,
        ),
        (
            EMissionWarning::WRN_ScrabNestingGrounds,
            DeepDiveWarning::ScrabNestingGrounds,
        ),
        (
            EMissionWarning::WRN_Swarmagedon,
            DeepDiveWarning::Swarmageddon,
        ),
    ];

    for (upstream, expected) in cases {
        let mut mission = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
        mission.warnings = vec![upstream];

        assert_eq!(map_mission(&mission).unwrap().warning, Some(expected));
    }
}

#[test]
fn mission_rejects_unsupported_or_multiple_warnings() {
    let mut unsupported = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    unsupported.warnings = vec![EMissionWarning::WRN_Plague];
    assert!(matches!(
        map_mission(&unsupported).unwrap_err(),
        ConverterError::UnexpectedDeepDiveWarning(_)
    ));

    let mut multiple = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    multiple.warnings = vec![EMissionWarning::WRN_Ghost, EMissionWarning::WRN_NoOxygen];
    assert!(matches!(
        map_mission(&multiple).unwrap_err(),
        ConverterError::WarningsCountMismatch { count: 2 }
    ));
}
