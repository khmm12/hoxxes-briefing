use super::*;
use crate::ConverterError;

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
fn deep_scan_values_by_duration_complexity() {
    assert_eq!(
        DeepDivePrimaryObjective::new_deep_scan(Duration::Short, Complexity::Average),
        DeepDivePrimaryObjective::DeepScan {
            resonance_crystals: 3
        }
    );
    assert_eq!(
        DeepDivePrimaryObjective::new_deep_scan(Duration::Normal, Complexity::Average),
        DeepDivePrimaryObjective::DeepScan {
            resonance_crystals: 5
        }
    );
}

#[test]
fn escort_duty_values_by_duration_complexity() {
    for duration in [Duration::Normal, Duration::Long] {
        for complexity in [Complexity::Average, Complexity::Complex] {
            let refuels = if duration == Duration::Normal { 1 } else { 2 };
            assert_eq!(
                DeepDivePrimaryObjective::new_escort_duty(duration, complexity),
                DeepDivePrimaryObjective::EscortDuty { refuels }
            );
        }
    }
}

#[test]
fn mining_expedition_values_by_duration_complexity() {
    let cases = [
        (Duration::Short, Complexity::Simple, 200),
        (Duration::Normal, Complexity::Simple, 225),
        (Duration::Normal, Complexity::Average, 250),
        (Duration::Long, Complexity::Average, 325),
        (Duration::Long, Complexity::Complex, 400),
    ];
    for (duration, complexity, morkite) in cases {
        assert_eq!(
            DeepDivePrimaryObjective::new_mining_expedition(duration, complexity),
            DeepDivePrimaryObjective::MiningExpedition { morkite }
        );
    }
}

#[test]
fn industrial_sabotage_is_constant() {
    assert_eq!(
        DeepDivePrimaryObjective::new_industrial_sabotage(Duration::Short, Complexity::Simple),
        DeepDivePrimaryObjective::IndustrialSabotage { power_stations: 2 }
    );
    assert_eq!(
        DeepDivePrimaryObjective::new_industrial_sabotage(Duration::Long, Complexity::Complex),
        DeepDivePrimaryObjective::IndustrialSabotage { power_stations: 2 }
    );
}

#[test]
fn egg_hunt_values_by_duration_complexity() {
    let cases = [
        (Duration::Short, Complexity::Simple, 4),
        (Duration::Normal, Complexity::Average, 6),
        (Duration::Long, Complexity::Average, 8),
    ];
    for (duration, complexity, eggs) in cases {
        assert_eq!(
            DeepDivePrimaryObjective::new_egg_hunt(duration, complexity),
            DeepDivePrimaryObjective::EggHunt { eggs }
        );
    }
}

#[test]
fn point_extraction_values_by_duration_complexity() {
    assert_eq!(
        DeepDivePrimaryObjective::new_point_extraction(Duration::Normal, Complexity::Complex),
        DeepDivePrimaryObjective::PointExtraction { aquarqs: 7 }
    );
    assert_eq!(
        DeepDivePrimaryObjective::new_point_extraction(Duration::Long, Complexity::Complex),
        DeepDivePrimaryObjective::PointExtraction { aquarqs: 10 }
    );
}

#[test]
fn on_site_refining_is_constant() {
    assert_eq!(
        DeepDivePrimaryObjective::new_on_site_refining(Duration::Short, Complexity::Simple),
        DeepDivePrimaryObjective::OnSiteRefining { morkite_wells: 3 }
    );
    assert_eq!(
        DeepDivePrimaryObjective::new_on_site_refining(Duration::Long, Complexity::Complex),
        DeepDivePrimaryObjective::OnSiteRefining { morkite_wells: 3 }
    );
}

#[test]
fn salvage_operation_values_by_duration_complexity() {
    assert_eq!(
        DeepDivePrimaryObjective::new_salvage_operation(Duration::Normal, Complexity::Average),
        DeepDivePrimaryObjective::SalvageOperation { mini_mules: 2 }
    );
    assert_eq!(
        DeepDivePrimaryObjective::new_salvage_operation(Duration::Long, Complexity::Complex),
        DeepDivePrimaryObjective::SalvageOperation { mini_mules: 3 }
    );
}

#[test]
fn heavy_extraction_values_by_duration_complexity() {
    for duration in [Duration::Normal, Duration::Long] {
        for complexity in [Complexity::Average, Complexity::Complex] {
            let resinite_masses = if duration == Duration::Normal { 3 } else { 4 };
            assert_eq!(
                DeepDivePrimaryObjective::new_heavy_extraction(duration, complexity),
                DeepDivePrimaryObjective::HeavyExtraction { resinite_masses }
            );
        }
    }
}
