use super::*;

#[test]
fn generate_payload_assembles_seed_and_both_dives() {
    let payload = generate_payload(1234).expect("valid seed generates a payload");

    assert_eq!(payload.seed, 1234);
    assert_eq!(payload.dives.normal.missions.len(), 3);
    assert_eq!(payload.dives.elite.missions.len(), 3);
}
