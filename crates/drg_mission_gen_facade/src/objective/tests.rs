use drg_mission_gen_core::{EDreadnought, EObjective, ObjectiveInstance};

use super::*;
use crate::{Complexity, Duration};

fn map_primary(
    kind: EObjective,
    duration: Duration,
    complexity: Complexity,
) -> Result<DeepDivePrimaryObjective, ConverterError> {
    map_primary_objective(
        ObjectiveInstance::from_objective(kind),
        duration,
        complexity,
    )
}

#[test]
fn dreadnoughts_reject_empty_input() {
    assert!(matches!(
        Dreadnoughts::try_new(vec![]),
        Err(ConverterError::EmptyDreadnoughts)
    ));
}

#[test]
fn dreadnoughts_preserve_order_and_support_iteration() {
    let dreadnoughts = Dreadnoughts::try_new(vec![
        Dreadnought::Twins,
        Dreadnought::Classic,
        Dreadnought::Hiveguard,
    ])
    .unwrap();

    assert_eq!(
        dreadnoughts.as_slice(),
        &[
            Dreadnought::Twins,
            Dreadnought::Classic,
            Dreadnought::Hiveguard,
        ]
    );

    let borrowed: Vec<_> = (&dreadnoughts).into_iter().copied().collect();
    assert_eq!(borrowed, dreadnoughts.as_slice());

    let owned: Vec<_> = dreadnoughts.clone().into_iter().collect();
    assert_eq!(owned, dreadnoughts.as_slice());
}

#[test]
fn dreadnoughts_try_from_delegates_to_constructor() {
    let dreadnoughts = Dreadnoughts::try_from(vec![Dreadnought::Classic]).unwrap();

    assert_eq!(dreadnoughts.as_slice(), &[Dreadnought::Classic]);
}

#[test]
fn primary_objective_maps_every_supported_configuration() {
    use EObjective::*;

    let cases = [
        (
            OBJ_1st_DeepScan,
            Duration::Short,
            Complexity::Average,
            DeepDivePrimaryObjective::DeepScan {
                resonance_crystals: 3,
            },
        ),
        (
            OBJ_1st_DeepScan,
            Duration::Normal,
            Complexity::Average,
            DeepDivePrimaryObjective::DeepScan {
                resonance_crystals: 5,
            },
        ),
        (
            OBJ_1st_Escort,
            Duration::Normal,
            Complexity::Average,
            DeepDivePrimaryObjective::EscortDuty { refuels: 1 },
        ),
        (
            OBJ_1st_Escort,
            Duration::Normal,
            Complexity::Complex,
            DeepDivePrimaryObjective::EscortDuty { refuels: 1 },
        ),
        (
            OBJ_1st_Escort,
            Duration::Long,
            Complexity::Average,
            DeepDivePrimaryObjective::EscortDuty { refuels: 2 },
        ),
        (
            OBJ_1st_Escort,
            Duration::Long,
            Complexity::Complex,
            DeepDivePrimaryObjective::EscortDuty { refuels: 2 },
        ),
        (
            OBJ_1st_Extraction,
            Duration::Short,
            Complexity::Simple,
            DeepDivePrimaryObjective::MiningExpedition { morkite: 200 },
        ),
        (
            OBJ_1st_Extraction,
            Duration::Normal,
            Complexity::Simple,
            DeepDivePrimaryObjective::MiningExpedition { morkite: 225 },
        ),
        (
            OBJ_1st_Extraction,
            Duration::Normal,
            Complexity::Average,
            DeepDivePrimaryObjective::MiningExpedition { morkite: 250 },
        ),
        (
            OBJ_1st_Extraction,
            Duration::Long,
            Complexity::Average,
            DeepDivePrimaryObjective::MiningExpedition { morkite: 325 },
        ),
        (
            OBJ_1st_Extraction,
            Duration::Long,
            Complexity::Complex,
            DeepDivePrimaryObjective::MiningExpedition { morkite: 400 },
        ),
        (
            OBJ_1st_Facility,
            Duration::Short,
            Complexity::Simple,
            DeepDivePrimaryObjective::IndustrialSabotage { power_stations: 2 },
        ),
        (
            OBJ_1st_Facility,
            Duration::Long,
            Complexity::Complex,
            DeepDivePrimaryObjective::IndustrialSabotage { power_stations: 2 },
        ),
        (
            OBJ_1st_Gather_AlienEggs,
            Duration::Short,
            Complexity::Simple,
            DeepDivePrimaryObjective::EggHunt { eggs: 4 },
        ),
        (
            OBJ_1st_Gather_AlienEggs,
            Duration::Normal,
            Complexity::Average,
            DeepDivePrimaryObjective::EggHunt { eggs: 6 },
        ),
        (
            OBJ_1st_Gather_AlienEggs,
            Duration::Long,
            Complexity::Average,
            DeepDivePrimaryObjective::EggHunt { eggs: 8 },
        ),
        (
            OBJ_1st_PointExtraction,
            Duration::Normal,
            Complexity::Complex,
            DeepDivePrimaryObjective::PointExtraction { aquarqs: 7 },
        ),
        (
            OBJ_1st_PointExtraction,
            Duration::Long,
            Complexity::Complex,
            DeepDivePrimaryObjective::PointExtraction { aquarqs: 10 },
        ),
        (
            OBJ_1st_Refinery,
            Duration::Short,
            Complexity::Simple,
            DeepDivePrimaryObjective::OnSiteRefining { morkite_wells: 3 },
        ),
        (
            OBJ_1st_Refinery,
            Duration::Long,
            Complexity::Complex,
            DeepDivePrimaryObjective::OnSiteRefining { morkite_wells: 3 },
        ),
        (
            OBJ_1st_Salvage,
            Duration::Normal,
            Complexity::Average,
            DeepDivePrimaryObjective::SalvageOperation { mini_mules: 2 },
        ),
        (
            OBJ_1st_Salvage,
            Duration::Long,
            Complexity::Complex,
            DeepDivePrimaryObjective::SalvageOperation { mini_mules: 3 },
        ),
        (
            OBJ_Excavation_C,
            Duration::Normal,
            Complexity::Average,
            DeepDivePrimaryObjective::HeavyExtraction { resinite_masses: 3 },
        ),
        (
            OBJ_Excavation_C,
            Duration::Normal,
            Complexity::Complex,
            DeepDivePrimaryObjective::HeavyExtraction { resinite_masses: 3 },
        ),
        (
            OBJ_Excavation_C,
            Duration::Long,
            Complexity::Average,
            DeepDivePrimaryObjective::HeavyExtraction { resinite_masses: 4 },
        ),
        (
            OBJ_Excavation_C,
            Duration::Long,
            Complexity::Complex,
            DeepDivePrimaryObjective::HeavyExtraction { resinite_masses: 4 },
        ),
    ];

    for (kind, duration, complexity, expected) in cases {
        assert_eq!(
            map_primary(kind, duration, complexity).unwrap(),
            expected,
            "kind {kind:?}, duration {duration:?}, complexity {complexity:?}"
        );
    }
}

#[test]
fn primary_objective_rejects_invalid_configurations_without_panicking() {
    use EObjective::*;

    let cases = [
        (OBJ_1st_DeepScan, Duration::Short, Complexity::Simple),
        (OBJ_1st_Escort, Duration::Short, Complexity::Average),
        (OBJ_1st_Extraction, Duration::Short, Complexity::Complex),
        (
            OBJ_1st_Gather_AlienEggs,
            Duration::Long,
            Complexity::Complex,
        ),
        (
            OBJ_1st_PointExtraction,
            Duration::Normal,
            Complexity::Average,
        ),
        (OBJ_1st_Salvage, Duration::Normal, Complexity::Complex),
        (OBJ_Excavation_C, Duration::Short, Complexity::Average),
    ];

    for (kind, duration, complexity) in cases {
        let expected_objective: &'static str = kind.into();
        assert!(matches!(
            map_primary(kind, duration, complexity).unwrap_err(),
            ConverterError::InvalidPrimaryObjectiveConfiguration {
                objective,
                duration: actual_duration,
                complexity: actual_complexity,
            } if objective == expected_objective
                && actual_duration == duration
                && actual_complexity == complexity
        ));
    }
}

#[test]
fn primary_elimination_maps_every_dreadnought_variant() {
    let objective = ObjectiveInstance::Elimination {
        kind: EObjective::OBJ_Eliminate_Eggs,
        targets: vec![
            EDreadnought::Dreadnought,
            EDreadnought::Hiveguard,
            EDreadnought::Twins,
        ],
    };

    assert_eq!(
        map_primary_objective(objective, Duration::Normal, Complexity::Average).unwrap(),
        DeepDivePrimaryObjective::Elimination {
            dreadnoughts: Dreadnoughts::try_new(vec![
                Dreadnought::Classic,
                Dreadnought::Hiveguard,
                Dreadnought::Twins,
            ])
            .unwrap(),
        }
    );
}

#[test]
fn primary_objective_rejects_empty_elimination_and_unsupported_kind() {
    assert!(matches!(
        map_primary(
            EObjective::OBJ_Eliminate_Eggs,
            Duration::Normal,
            Complexity::Average,
        )
        .unwrap_err(),
        ConverterError::EmptyDreadnoughts
    ));

    assert!(matches!(
        map_primary(
            EObjective::OBJ_2nd_KillFleas,
            Duration::Normal,
            Complexity::Average,
        )
        .unwrap_err(),
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
        assert_eq!(
            map_secondary_objective(ObjectiveInstance::from_objective(kind)).unwrap(),
            expected,
            "kind {kind:?}"
        );
    }

    let elimination = ObjectiveInstance::Elimination {
        kind: OBJ_DD_Elimination_Eggs,
        targets: vec![EDreadnought::Hiveguard],
    };
    assert_eq!(
        map_secondary_objective(elimination).unwrap(),
        DeepDiveSecondaryObjective::Elimination {
            dreadnoughts: Dreadnoughts::try_new(vec![Dreadnought::Hiveguard]).unwrap(),
        }
    );
}

#[test]
fn secondary_objective_rejects_empty_elimination_and_unsupported_kind() {
    assert!(matches!(
        map_secondary_objective(ObjectiveInstance::from_objective(
            EObjective::OBJ_DD_Elimination_Eggs,
        ))
        .unwrap_err(),
        ConverterError::EmptyDreadnoughts
    ));

    assert!(matches!(
        map_secondary_objective(ObjectiveInstance::from_objective(
            EObjective::OBJ_2nd_KillFleas,
        ))
        .unwrap_err(),
        ConverterError::UnexpectedDeepDiveSecondaryObjective(_)
    ));
}

#[test]
fn objective_mapping_rejects_mismatched_upstream_shape() {
    let non_elimination_with_targets = ObjectiveInstance::Elimination {
        kind: EObjective::OBJ_1st_DeepScan,
        targets: vec![],
    };
    assert!(matches!(
        map_primary_objective(
            non_elimination_with_targets,
            Duration::Normal,
            Complexity::Average,
        )
        .unwrap_err(),
        ConverterError::UnexpectedDeepDivePrimaryObjective(_)
    ));

    let primary_elimination_without_targets = ObjectiveInstance::Other {
        kind: EObjective::OBJ_Eliminate_Eggs,
    };
    assert!(matches!(
        map_primary_objective(
            primary_elimination_without_targets,
            Duration::Normal,
            Complexity::Average,
        )
        .unwrap_err(),
        ConverterError::UnexpectedDeepDivePrimaryObjective(_)
    ));

    let secondary_elimination_without_targets = ObjectiveInstance::Other {
        kind: EObjective::OBJ_DD_Elimination_Eggs,
    };
    assert!(matches!(
        map_secondary_objective(secondary_elimination_without_targets).unwrap_err(),
        ConverterError::UnexpectedDeepDiveSecondaryObjective(_)
    ));
}
