use drg_mission_gen_core::{
    EBiome, EMissionDNA, EMissionTemplate, EObjective, ObjectiveInstance, UDeepDive,
    UGeneratedMission,
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
fn deep_dive_rejects_wrong_mission_count() {
    let result = map_deep_dive(UDeepDive {
        name: "Bad Dive".to_string(),
        biome: EBiome::BIOME_CrystalCaves,
        missions: vec![],
    });

    assert!(matches!(
        result.unwrap_err(),
        ConverterError::MissionsCountMismatch { count: 0 }
    ));
}

#[test]
fn deep_dive_propagates_conversion_error_from_any_mission_index() {
    let good = mission_with_secondaries(vec![EObjective::OBJ_DD_AlienEggs]);
    let bad = mission_with_secondaries(vec![]);

    for bad_index in 0..MISSION_COUNT {
        let mut missions = [good.clone(), good.clone(), good.clone()];
        missions[bad_index] = bad.clone();

        let result = map_deep_dive(UDeepDive {
            name: "Bad Dive".to_string(),
            biome: EBiome::BIOME_CrystalCaves,
            missions: missions.to_vec(),
        });

        assert!(
            matches!(
                result.unwrap_err(),
                ConverterError::SecondaryObjectivesCountMismatch { count: 0 }
            ),
            "expected failure to propagate from mission index {bad_index}"
        );
    }
}

#[test]
fn biome_mapping_covers_every_upstream_variant() {
    let cases = [
        (EBiome::BIOME_AzureWeald, Biome::AzureWeald),
        (EBiome::BIOME_CrystalCaves, Biome::CrystallineCaverns),
        (EBiome::BIOME_FungusBogs, Biome::FungusBogs),
        (EBiome::BIOME_HollowBough, Biome::HollowBough),
        (EBiome::BIOME_IceCaves, Biome::GlacialStrata),
        (EBiome::BIOME_LushDownpour, Biome::DenseBiozone),
        (EBiome::BIOME_MagmaCaves, Biome::MagmaCore),
        (EBiome::BIOME_OssuaryDepths, Biome::OssuaryDepths),
        (
            EBiome::BIOME_RadioactiveZone,
            Biome::RadioactiveExclusionZone,
        ),
        (EBiome::BIOME_SaltCaves, Biome::SaltPits),
        (
            EBiome::BIOME_SandblastedCorridors,
            Biome::SandblastedCorridors,
        ),
    ];

    for (upstream, expected) in cases {
        assert_eq!(map_biome(upstream), expected);
    }
}
