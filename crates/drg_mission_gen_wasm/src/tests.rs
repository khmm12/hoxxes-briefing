use super::*;

#[test]
fn generate_payload_assembles_seed_and_both_dives() {
    let payload = generate_payload(1234).expect("valid seed generates a payload");

    assert_eq!(payload.seed, 1234);
    assert_eq!(
        payload.dives.normal.missions.0.len(),
        drg_mission_gen_facade::MISSION_COUNT
    );
    assert_eq!(
        payload.dives.elite.missions.0.len(),
        drg_mission_gen_facade::MISSION_COUNT
    );
}
