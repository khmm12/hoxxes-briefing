use drg_mission_gen_core::{
    EMissionComplexity, EMissionDNA, EMissionDuration, EMissionMutator, EMissionWarning,
    ObjectiveInstance, UGeneratedMission,
};

use crate::{
    ConverterError, DeepDivePrimaryObjective, DeepDiveSecondaryObjective,
    objective::{map_primary_objective, map_secondary_objective},
};

#[derive(Debug, Clone, PartialEq)]
pub struct DeepDiveMission {
    pub primary_objective: DeepDivePrimaryObjective,
    pub secondary_objective: DeepDiveSecondaryObjective,
    pub anomaly: Option<DeepDiveAnomaly>,
    pub warning: Option<DeepDiveWarning>,
    pub complexity: Complexity,
    pub duration: Duration,
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub enum DeepDiveAnomaly {
    VolatileGuts,
    RichAtmosphere,
    CriticalWeakness,
    BloodSugar,
    LowGravity,
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub enum DeepDiveWarning {
    CaveLeechCluster,
    DuckAndCover,
    EboniteOutbreak,
    EliteThreat,
    ExploderInfestation,
    HauntedCave,
    LethalEnemies,
    LowOxygen,
    MacteraPlague,
    Parasites,
    PitJawColony,
    RegenerativeBugs,
    RivalPresence,
    ScrabNestingGrounds,
    ShieldDisruption,
    Swarmageddon,
}

#[derive(Debug, Copy, Clone, PartialEq, PartialOrd)]
pub enum Complexity {
    Simple,
    Average,
    Complex,
}

#[derive(Debug, Copy, Clone, PartialEq, PartialOrd)]
pub enum Duration {
    Short,
    Normal,
    Long,
}

pub(crate) fn map_mission(upstream: &UGeneratedMission) -> Result<DeepDiveMission, ConverterError> {
    let (complexity, duration) = map_dna(upstream.dna);
    let primary_objective =
        map_primary_objective(upstream.primary_objective.clone(), duration, complexity)?;
    let secondary_objective =
        map_secondary_objective(require_secondary_objective(&upstream.secondary_objectives)?)?;
    let anomaly = map_anomaly(&upstream.mutators)?;
    let warning = map_warning(&upstream.warnings)?;

    Ok(DeepDiveMission {
        primary_objective,
        secondary_objective,
        anomaly,
        warning,
        complexity,
        duration,
    })
}

fn map_dna(dna: EMissionDNA) -> (Complexity, Duration) {
    let dna = dna.get();
    (map_complexity(dna.complexity), map_duration(dna.duration))
}

fn require_secondary_objective(
    objectives: &[ObjectiveInstance],
) -> Result<ObjectiveInstance, ConverterError> {
    match objectives {
        [objective] => Ok(objective.clone()),
        _ => Err(ConverterError::SecondaryObjectivesCountMismatch {
            count: objectives.len(),
        }),
    }
}

fn map_anomaly(mutators: &[EMissionMutator]) -> Result<Option<DeepDiveAnomaly>, ConverterError> {
    let mutator = match mutators {
        [] => return Ok(None),
        [mutator] => *mutator,
        _ => {
            return Err(ConverterError::MutatorsCountMismatch {
                count: mutators.len(),
            });
        }
    };

    use DeepDiveAnomaly::*;
    use EMissionMutator::*;

    let anomaly = match mutator {
        MMUT_BloodSugar => BloodSugar,
        MMUT_ExplosiveEnemies => VolatileGuts,
        MMUT_LowGravity => LowGravity,
        MMUT_OxygenRich => RichAtmosphere,
        MMUT_Weakspot => CriticalWeakness,
        MMUT_ExterminationContract
        | MMUT_GoldRush
        | MMUT_RichInMinerals
        | MMUT_SecretSecondary
        | MMUT_XXXP => {
            return Err(ConverterError::UnexpectedDeepDiveMutator(mutator.into()));
        }
    };

    Ok(Some(anomaly))
}

fn map_warning(warnings: &[EMissionWarning]) -> Result<Option<DeepDiveWarning>, ConverterError> {
    let warning = match warnings {
        [] => return Ok(None),
        [warning] => *warning,
        _ => {
            return Err(ConverterError::WarningsCountMismatch {
                count: warnings.len(),
            });
        }
    };

    use DeepDiveWarning::*;
    use EMissionWarning::*;

    let warning = match warning {
        WRN_BulletHell => DuckAndCover,
        WRN_CaveLeechDen => CaveLeechCluster,
        WRN_ExploderInfestation => ExploderInfestation,
        WRN_Ghost => HauntedCave,
        WRN_HeroEnemies => EliteThreat,
        WRN_InfestedEnemies => Parasites,
        WRN_LethalEnemies => LethalEnemies,
        WRN_MacteraCave => MacteraPlague,
        WRN_NoOxygen => LowOxygen,
        WRN_NoShields => ShieldDisruption,
        WRN_PitJawColony => PitJawColony,
        WRN_RegenerativeEnemies => RegenerativeBugs,
        WRN_RivalIncursion => RivalPresence,
        WRN_RockInfestation => EboniteOutbreak,
        WRN_ScrabNestingGrounds => ScrabNestingGrounds,
        WRN_Swarmagedon => Swarmageddon,
        WRN_Plague => {
            return Err(ConverterError::UnexpectedDeepDiveWarning(warning.into()));
        }
    };

    Ok(Some(warning))
}

fn map_complexity(complexity: EMissionComplexity) -> Complexity {
    use Complexity::*;
    use EMissionComplexity::*;

    match complexity {
        MD_Complexity_Complex => Complex,
        MD_Complexity_Average => Average,
        MD_Complexity_Simple => Simple,
    }
}

fn map_duration(duration: EMissionDuration) -> Duration {
    use Duration::*;
    use EMissionDuration::*;

    match duration {
        MD_Duration_Long => Long,
        MD_Duration_Normal => Normal,
        MD_Duration_Short => Short,
    }
}

#[cfg(test)]
mod tests;
