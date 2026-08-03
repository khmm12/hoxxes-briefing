use drg_mission_gen_core::{EBiome, UDeepDive, UGeneratedMission};

use crate::{ConverterError, DeepDiveMission, mission::map_mission};

pub const MISSION_COUNT: usize = 3;

#[derive(Debug, Clone, PartialEq)]
pub struct DeepDive {
    pub name: String,
    pub biome: Biome,
    pub missions: DeepDiveMissions,
}

#[derive(Debug, Clone, PartialEq)]
pub struct DeepDiveMissions(pub [DeepDiveMission; MISSION_COUNT]);

#[derive(Debug, Copy, Clone, PartialEq)]
pub enum Biome {
    AzureWeald,
    CrystallineCaverns,
    DenseBiozone,
    FungusBogs,
    GlacialStrata,
    HollowBough,
    MagmaCore,
    OssuaryDepths,
    RadioactiveExclusionZone,
    SaltPits,
    SandblastedCorridors,
}

pub(crate) fn map_deep_dive(upstream: UDeepDive) -> Result<DeepDive, ConverterError> {
    Ok(DeepDive {
        name: upstream.name,
        biome: map_biome(upstream.biome),
        missions: map_missions(&upstream.missions)?,
    })
}

fn map_missions(missions: &[UGeneratedMission]) -> Result<DeepDiveMissions, ConverterError> {
    let [first, second, third] = missions else {
        return Err(ConverterError::MissionsCountMismatch {
            count: missions.len(),
        });
    };

    Ok(DeepDiveMissions([
        map_mission(first)?,
        map_mission(second)?,
        map_mission(third)?,
    ]))
}

fn map_biome(biome: EBiome) -> Biome {
    use Biome::*;
    use EBiome::*;

    match biome {
        BIOME_AzureWeald => AzureWeald,
        BIOME_CrystalCaves => CrystallineCaverns,
        BIOME_FungusBogs => FungusBogs,
        BIOME_HollowBough => HollowBough,
        BIOME_IceCaves => GlacialStrata,
        BIOME_LushDownpour => DenseBiozone,
        BIOME_MagmaCaves => MagmaCore,
        BIOME_OssuaryDepths => OssuaryDepths,
        BIOME_RadioactiveZone => RadioactiveExclusionZone,
        BIOME_SaltCaves => SaltPits,
        BIOME_SandblastedCorridors => SandblastedCorridors,
    }
}

#[cfg(test)]
mod tests;
