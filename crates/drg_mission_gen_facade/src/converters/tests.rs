use super::*;

#[test]
fn biome_covers_every_upstream_variant() {
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
        assert_eq!(Biome::from(upstream), expected);
    }
}

#[test]
fn complexity_covers_every_upstream_variant() {
    assert_eq!(
        Complexity::from(EMissionComplexity::MD_Complexity_Simple),
        Complexity::Simple
    );
    assert_eq!(
        Complexity::from(EMissionComplexity::MD_Complexity_Average),
        Complexity::Average
    );
    assert_eq!(
        Complexity::from(EMissionComplexity::MD_Complexity_Complex),
        Complexity::Complex
    );
}

#[test]
fn duration_covers_every_upstream_variant() {
    assert_eq!(
        Duration::from(EMissionDuration::MD_Duration_Short),
        Duration::Short
    );
    assert_eq!(
        Duration::from(EMissionDuration::MD_Duration_Normal),
        Duration::Normal
    );
    assert_eq!(
        Duration::from(EMissionDuration::MD_Duration_Long),
        Duration::Long
    );
}

#[test]
fn dreadnought_covers_every_upstream_variant() {
    assert_eq!(
        Dreadnought::from(EDreadnought::Dreadnought),
        Dreadnought::Classic
    );
    assert_eq!(Dreadnought::from(EDreadnought::Twins), Dreadnought::Twins);
    assert_eq!(
        Dreadnought::from(EDreadnought::Hiveguard),
        Dreadnought::Hiveguard
    );
}

#[test]
fn anomaly_maps_every_supported_variant() {
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
        assert_eq!(DeepDiveAnomaly::try_from(upstream).unwrap(), expected);
    }
}

#[test]
fn anomaly_rejects_every_deep_dive_incompatible_variant() {
    let unsupported = [
        EMissionMutator::MMUT_ExterminationContract,
        EMissionMutator::MMUT_GoldRush,
        EMissionMutator::MMUT_RichInMinerals,
        EMissionMutator::MMUT_SecretSecondary,
        EMissionMutator::MMUT_XXXP,
    ];

    for mutator in unsupported {
        assert!(matches!(
            DeepDiveAnomaly::try_from(mutator).unwrap_err(),
            ConverterError::UnexpectedDeepDiveMutator(_)
        ));
    }
}

#[test]
fn warning_maps_every_supported_variant() {
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
        assert_eq!(DeepDiveWarning::try_from(upstream).unwrap(), expected);
    }
}

#[test]
fn warning_rejects_plague() {
    assert!(matches!(
        DeepDiveWarning::try_from(EMissionWarning::WRN_Plague).unwrap_err(),
        ConverterError::UnexpectedDeepDiveWarning(_)
    ));
}

#[test]
fn primary_objective_maps_every_supported_kind() {
    use EObjective::*;

    // Every supported upstream kind must route to its specific objective
    // variant at (Normal, Average); a swapped dispatch arm would fail here.
    let cases = [
        (
            OBJ_1st_DeepScan,
            DeepDivePrimaryObjective::DeepScan {
                resonance_crystals: 5,
            },
        ),
        (
            OBJ_1st_Escort,
            DeepDivePrimaryObjective::EscortDuty { refuels: 1 },
        ),
        (
            OBJ_1st_Extraction,
            DeepDivePrimaryObjective::MiningExpedition { morkite: 250 },
        ),
        (
            OBJ_1st_Facility,
            DeepDivePrimaryObjective::IndustrialSabotage { power_stations: 2 },
        ),
        (
            OBJ_1st_Gather_AlienEggs,
            DeepDivePrimaryObjective::EggHunt { eggs: 6 },
        ),
        (
            OBJ_1st_Refinery,
            DeepDivePrimaryObjective::OnSiteRefining { morkite_wells: 3 },
        ),
        (
            OBJ_1st_Salvage,
            DeepDivePrimaryObjective::SalvageOperation { mini_mules: 2 },
        ),
        (
            OBJ_Excavation_C,
            DeepDivePrimaryObjective::HeavyExtraction { resinite_masses: 3 },
        ),
    ];

    for (kind, expected) in cases {
        let instance = ObjectiveInstance::from_objective(kind);
        let result =
            map_primary_objective_instance(instance, Duration::Normal, Complexity::Average);
        assert_eq!(result.unwrap(), expected, "kind {kind:?}");
    }

    // PointExtraction only exists at Complex complexity, so it is checked apart.
    let point_extraction = ObjectiveInstance::from_objective(OBJ_1st_PointExtraction);
    let result =
        map_primary_objective_instance(point_extraction, Duration::Normal, Complexity::Complex);
    assert_eq!(
        result.unwrap(),
        DeepDivePrimaryObjective::PointExtraction { aquarqs: 7 }
    );

    // Upstream targets pass through as the elimination dreadnought types.
    let elimination = ObjectiveInstance::Elimination {
        kind: OBJ_Eliminate_Eggs,
        targets: vec![EDreadnought::Twins, EDreadnought::Hiveguard],
    };
    let result = map_primary_objective_instance(elimination, Duration::Normal, Complexity::Average);
    assert_eq!(
        result.unwrap(),
        DeepDivePrimaryObjective::Elimination {
            dreadnought_kinds: DreadnoughtRoster::try_new(vec![
                Dreadnought::Twins,
                Dreadnought::Hiveguard,
            ])
            .unwrap(),
        }
    );
}

#[test]
fn primary_objective_rejects_empty_elimination_targets() {
    let instance = ObjectiveInstance::from_objective(EObjective::OBJ_Eliminate_Eggs);
    let result = map_primary_objective_instance(instance, Duration::Normal, Complexity::Average);

    assert!(matches!(
        result.unwrap_err(),
        ConverterError::EmptyDreadnoughtRoster
    ));
}

#[test]
fn primary_objective_rejects_unsupported_kind() {
    let instance = ObjectiveInstance::from_objective(EObjective::OBJ_2nd_KillFleas);
    let result = map_primary_objective_instance(instance, Duration::Normal, Complexity::Average);
    assert!(matches!(
        result.unwrap_err(),
        ConverterError::UnexpectedDeepDivePrimaryObjective(_)
    ));
}

#[test]
fn secondary_objective_maps_every_supported_kind() {
    use EObjective::*;

    let cases = [
        (
            OBJ_DD_AlienEggs,
            DeepDiveSecondaryObjective::EggHunt { eggs: 2 },
        ),
        (
            OBJ_DD_DeepScan,
            DeepDiveSecondaryObjective::DeepScan {
                resonance_crystals: 2,
            },
        ),
        (
            OBJ_DD_Defense,
            DeepDiveSecondaryObjective::Blackbox { black_boxes: 1 },
        ),
        (
            OBJ_DD_Excavation,
            DeepDiveSecondaryObjective::HeavyExtraction { resinite_masses: 1 },
        ),
        (
            OBJ_DD_Morkite,
            DeepDiveSecondaryObjective::MiningExpedition { morkite: 150 },
        ),
        (
            OBJ_DD_MorkiteWell,
            DeepDiveSecondaryObjective::OnSiteRefining { morkite_wells: 1 },
        ),
        (
            OBJ_DD_RepairMinimules,
            DeepDiveSecondaryObjective::SalvageOperation { mini_mules: 2 },
        ),
    ];

    for (kind, expected) in cases {
        let instance = ObjectiveInstance::from_objective(kind);
        let result =
            map_secondary_objective_instance(instance, Duration::Normal, Complexity::Average);
        assert_eq!(result.unwrap(), expected);
    }

    let elimination = ObjectiveInstance::Elimination {
        kind: OBJ_DD_Elimination_Eggs,
        targets: vec![EDreadnought::Hiveguard],
    };
    let result =
        map_secondary_objective_instance(elimination, Duration::Normal, Complexity::Average);
    assert_eq!(
        result.unwrap(),
        DeepDiveSecondaryObjective::Elimination {
            dreadnought_kinds: DreadnoughtRoster::try_new(vec![Dreadnought::Hiveguard]).unwrap(),
        }
    );
}

#[test]
fn secondary_objective_rejects_empty_elimination_targets() {
    let instance = ObjectiveInstance::from_objective(EObjective::OBJ_DD_Elimination_Eggs);
    let result = map_secondary_objective_instance(instance, Duration::Normal, Complexity::Average);

    assert!(matches!(
        result.unwrap_err(),
        ConverterError::EmptyDreadnoughtRoster
    ));
}

#[test]
fn secondary_objective_rejects_unsupported_kind() {
    let instance = ObjectiveInstance::from_objective(EObjective::OBJ_2nd_KillFleas);
    let result = map_secondary_objective_instance(instance, Duration::Normal, Complexity::Average);
    assert!(matches!(
        result.unwrap_err(),
        ConverterError::UnexpectedDeepDiveSecondaryObjective(_)
    ));
}

#[test]
fn map_mutators_handles_zero_one_and_too_many() {
    assert_eq!(map_mutators(&[]).unwrap(), None);
    assert_eq!(
        map_mutators(&[EMissionMutator::MMUT_BloodSugar]).unwrap(),
        Some(EMissionMutator::MMUT_BloodSugar)
    );
    assert!(matches!(
        map_mutators(&[
            EMissionMutator::MMUT_BloodSugar,
            EMissionMutator::MMUT_LowGravity,
        ])
        .unwrap_err(),
        ConverterError::MutatorsCountMismatch { count: 2 }
    ));
}

#[test]
fn map_warnings_handles_zero_one_and_too_many() {
    assert_eq!(map_warnings(&[]).unwrap(), None);
    assert_eq!(
        map_warnings(&[EMissionWarning::WRN_Ghost]).unwrap(),
        Some(EMissionWarning::WRN_Ghost)
    );
    assert!(matches!(
        map_warnings(&[EMissionWarning::WRN_Ghost, EMissionWarning::WRN_NoOxygen]).unwrap_err(),
        ConverterError::WarningsCountMismatch { count: 2 }
    ));
}

#[test]
fn map_secondary_objectives_handles_one_and_mismatched_counts() {
    let single = [ObjectiveInstance::from_objective(
        EObjective::OBJ_DD_AlienEggs,
    )];
    assert!(map_secondary_objectives(&single).is_ok());

    assert!(matches!(
        map_secondary_objectives(&[]).unwrap_err(),
        ConverterError::SecondaryObjectivesCountMismatch { count: 0 }
    ));

    let two = [
        ObjectiveInstance::from_objective(EObjective::OBJ_DD_AlienEggs),
        ObjectiveInstance::from_objective(EObjective::OBJ_DD_DeepScan),
    ];
    assert!(matches!(
        map_secondary_objectives(&two).unwrap_err(),
        ConverterError::SecondaryObjectivesCountMismatch { count: 2 }
    ));
}

#[test]
fn map_dna_reads_complexity_and_duration() {
    let (complexity, duration) = map_dna(EMissionDNA::DNA_2_01);
    assert_eq!(complexity, Complexity::Simple);
    assert_eq!(duration, Duration::Short);
}
