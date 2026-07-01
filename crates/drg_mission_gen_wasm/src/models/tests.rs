use super::*;

use drg_mission_gen_facade as facade;

#[test]
fn biome_maps_every_variant() {
    assert_eq!(Biome::from(facade::Biome::AzureWeald), Biome::AzureWeald);
    assert_eq!(
        Biome::from(facade::Biome::CrystallineCaverns),
        Biome::CrystallineCaverns
    );
    assert_eq!(
        Biome::from(facade::Biome::DenseBiozone),
        Biome::DenseBiozone
    );
    assert_eq!(Biome::from(facade::Biome::FungusBogs), Biome::FungusBogs);
    assert_eq!(
        Biome::from(facade::Biome::GlacialStrata),
        Biome::GlacialStrata
    );
    assert_eq!(Biome::from(facade::Biome::HollowBough), Biome::HollowBough);
    assert_eq!(Biome::from(facade::Biome::MagmaCore), Biome::MagmaCore);
    assert_eq!(
        Biome::from(facade::Biome::OssuaryDepths),
        Biome::OssuaryDepths
    );
    assert_eq!(
        Biome::from(facade::Biome::RadioactiveExclusionZone),
        Biome::RadioactiveExclusionZone
    );
    assert_eq!(Biome::from(facade::Biome::SaltPits), Biome::SaltPits);
    assert_eq!(
        Biome::from(facade::Biome::SandblastedCorridors),
        Biome::SandblastedCorridors
    );
}

#[test]
fn deep_dive_anomaly_maps_every_variant() {
    assert_eq!(
        DeepDiveAnomaly::from(facade::DeepDiveAnomaly::BloodSugar),
        DeepDiveAnomaly::BloodSugar
    );
    assert_eq!(
        DeepDiveAnomaly::from(facade::DeepDiveAnomaly::CriticalWeakness),
        DeepDiveAnomaly::CriticalWeakness
    );
    assert_eq!(
        DeepDiveAnomaly::from(facade::DeepDiveAnomaly::LowGravity),
        DeepDiveAnomaly::LowGravity
    );
    assert_eq!(
        DeepDiveAnomaly::from(facade::DeepDiveAnomaly::RichAtmosphere),
        DeepDiveAnomaly::RichAtmosphere
    );
    assert_eq!(
        DeepDiveAnomaly::from(facade::DeepDiveAnomaly::VolatileGuts),
        DeepDiveAnomaly::VolatileGuts
    );
}

#[test]
fn deep_dive_warning_maps_every_variant() {
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::CaveLeechCluster),
        DeepDiveWarning::CaveLeechCluster
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::DuckAndCover),
        DeepDiveWarning::DuckAndCover
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::EboniteOutbreak),
        DeepDiveWarning::EboniteOutbreak
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::EliteThreat),
        DeepDiveWarning::EliteThreat
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::ExploderInfestation),
        DeepDiveWarning::ExploderInfestation
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::HauntedCave),
        DeepDiveWarning::HauntedCave
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::LethalEnemies),
        DeepDiveWarning::LethalEnemies
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::LowOxygen),
        DeepDiveWarning::LowOxygen
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::MacteraPlague),
        DeepDiveWarning::MacteraPlague
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::Parasites),
        DeepDiveWarning::Parasites
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::PitJawColony),
        DeepDiveWarning::PitJawColony
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::RegenerativeBugs),
        DeepDiveWarning::RegenerativeBugs
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::RivalPresence),
        DeepDiveWarning::RivalPresence
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::ScrabNestingGrounds),
        DeepDiveWarning::ScrabNestingGrounds
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::ShieldDisruption),
        DeepDiveWarning::ShieldDisruption
    );
    assert_eq!(
        DeepDiveWarning::from(facade::DeepDiveWarning::Swarmageddon),
        DeepDiveWarning::Swarmageddon
    );
}

#[test]
fn dreadnought_maps_every_variant() {
    assert_eq!(
        Dreadnought::from(facade::Dreadnought::Classic),
        Dreadnought::Classic
    );
    assert_eq!(
        Dreadnought::from(facade::Dreadnought::Hiveguard),
        Dreadnought::Hiveguard
    );
    assert_eq!(
        Dreadnought::from(facade::Dreadnought::Twins),
        Dreadnought::Twins
    );
}

#[test]
fn dreadnought_serializes_each_variant_by_domain_name() {
    assert_eq!(
        serde_json::to_string(&Dreadnought::Classic).unwrap(),
        "\"Classic\""
    );
    assert_eq!(
        serde_json::to_string(&Dreadnought::Hiveguard).unwrap(),
        "\"Hiveguard\""
    );
    assert_eq!(
        serde_json::to_string(&Dreadnought::Twins).unwrap(),
        "\"Twins\""
    );
}

#[test]
fn secondary_heavy_extraction_serializes_by_domain_name() {
    assert_eq!(
        serde_json::to_string(&DeepDiveSecondaryObjective::HeavyExtraction { resinite_masses: 2 })
            .unwrap(),
        "{\"kind\":\"HeavyExtraction\",\"resiniteMasses\":2}"
    );
}
