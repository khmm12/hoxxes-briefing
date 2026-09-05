use drg_mission_gen_wasm::generate_payload;
use serde_json::Value;

#[test]
fn reproduces_complete_observed_deep_dives() {
    let cases = [
        (
            32502,
            include_str!("../../../test/fixtures/briefing/2026-08-27.json"),
        ),
        (
            3322316356,
            include_str!("../../../test/fixtures/briefing/2026-09-03.json"),
        ),
    ];

    for (seed, fixture) in cases {
        let expected: Value = serde_json::from_str(fixture).unwrap();
        let actual = serde_json::to_value(generate_payload(seed).unwrap()).unwrap();
        assert_eq!(actual, expected, "seed {seed}");
    }
}
