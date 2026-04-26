mod converters;
mod errors;
mod models;

use drg_mission_gen_core::gen_deep_dive_pair;

pub use errors::*;
pub use models::*;

pub fn deep_dives_from_seed(seed: Seed) -> Result<DeepDiveResult, ConverterError> {
    let (u_normal, u_elite) = gen_deep_dive_pair(seed.as_u32());
    let (normal, elite) = (u_normal.try_into()?, u_elite.try_into()?);

    return Ok(DeepDiveResult {
        normal,
        elite,
        seed,
    });
}

impl DeepDiveResult {
    pub fn from_seed(seed: Seed) -> Result<Self, ConverterError> {
        deep_dives_from_seed(seed)
    }
}

impl TryFrom<Seed> for DeepDiveResult {
    type Error = ConverterError;

    fn try_from(seed: Seed) -> Result<Self, Self::Error> {
        DeepDiveResult::from_seed(seed)
    }
}
