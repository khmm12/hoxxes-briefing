use drg_mission_gen_core::gen_deep_dive_pair;

use crate::{ConverterError, DeepDive, deep_dive::map_deep_dive};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Seed(u32);

impl Seed {
    pub fn new(seed: u32) -> Self {
        Self(seed)
    }

    pub fn as_u32(&self) -> u32 {
        self.0
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct DeepDiveResult {
    pub normal: DeepDive,
    pub elite: DeepDive,
    pub seed: Seed,
}

pub fn deep_dives_from_seed(seed: Seed) -> Result<DeepDiveResult, ConverterError> {
    let (normal, elite) = gen_deep_dive_pair(seed.as_u32());

    Ok(DeepDiveResult {
        normal: map_deep_dive(normal)?,
        elite: map_deep_dive(elite)?,
        seed,
    })
}

#[cfg(test)]
mod tests;
