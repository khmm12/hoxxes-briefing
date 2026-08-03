use super::*;

#[test]
fn generation_preserves_seed() {
    let result = deep_dives_from_seed(Seed::new(42)).unwrap();

    assert_eq!(result.seed.as_u32(), 42);
}
