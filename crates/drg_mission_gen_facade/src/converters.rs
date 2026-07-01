use drg_mission_gen_core::{
    EBiome, EDreadnought, EMissionComplexity, EMissionDNA, EMissionDuration, EMissionMutator,
    EMissionWarning, EObjective, ObjectiveInstance, UDeepDive, UGeneratedMission,
};

use crate::{
    ConverterError, DeepDivePrimaryObjective, DeepDiveSecondaryObjective, Dreadnought,
    MISSION_COUNT,
    models::{
        Biome, Complexity, DeepDive, DeepDiveMission, DeepDiveMissions, DeepDiveMutator,
        DeepDiveWarning, Duration,
    },
};

impl TryFrom<UDeepDive> for DeepDive {
    type Error = ConverterError;

    fn try_from(u_deep_dive: UDeepDive) -> Result<Self, Self::Error> {
        let name = u_deep_dive.name;
        let biome = u_deep_dive.biome.into();
        let missions = map_missions(&u_deep_dive.missions)?;

        Ok(DeepDive {
            name,
            biome,
            missions,
        })
    }
}

fn map_missions(missions: &[UGeneratedMission]) -> Result<DeepDiveMissions, ConverterError> {
    // let missions: Result<Vec<_>, _> = missions.iter().map(map_mission).collect();

    // missions?
    //     .try_into()
    //     .map(DeepDiveMissions)
    //     .map_err(|v: Vec<_>| ConverterError::MissionsCountMismatch { count: v.len() })

    if missions.len() != MISSION_COUNT {
        return Err(ConverterError::MissionsCountMismatch {
            count: missions.len(),
        });
    }

    Ok(DeepDiveMissions([
        (&missions[0]).try_into()?,
        (&missions[1]).try_into()?,
        (&missions[2]).try_into()?,
    ]))
}

impl TryFrom<&UGeneratedMission> for DeepDiveMission {
    type Error = ConverterError;

    fn try_from(u_mission: &UGeneratedMission) -> Result<Self, Self::Error> {
        let (complexity, duration) = map_dna(u_mission.dna);

        let primary_objective = map_primary_objective_instance(
            u_mission.primary_objective.clone(),
            duration,
            complexity,
        )?;

        let secondary_objective = map_secondary_objective_instance(
            map_secondary_objectives(&u_mission.secondary_objectives)?,
            duration,
            complexity,
        )?;

        let mutator = match map_mutators(&u_mission.mutators)? {
            Some(m) => Some(DeepDiveMutator::try_from(m)?),
            None => None,
        };

        let warning = match map_warnings(&u_mission.warnings)? {
            Some(w) => Some(DeepDiveWarning::try_from(w)?),
            None => None,
        };

        Ok(DeepDiveMission {
            primary_objective,
            secondary_objective,
            mutator,
            warning,
            complexity,
            duration,
        })
    }
}

fn map_dna(dna: EMissionDNA) -> (Complexity, Duration) {
    let dna = dna.get();
    (dna.complexity.into(), dna.duration.into())
}

fn map_secondary_objectives(
    objs: &[ObjectiveInstance],
) -> Result<ObjectiveInstance, ConverterError> {
    match objs {
        [obj] => Ok(obj.clone()),
        _ => Err(ConverterError::SecondaryObjectivesCountMismatch { count: objs.len() }),
    }
}

fn map_mutators(mutators: &[EMissionMutator]) -> Result<Option<EMissionMutator>, ConverterError> {
    match mutators {
        [] => Ok(None),
        [mutator] => Ok(Some(*mutator)),
        _ => Err(ConverterError::MutatorsCountMismatch {
            count: mutators.len(),
        }),
    }
}

fn map_warnings(warnings: &[EMissionWarning]) -> Result<Option<EMissionWarning>, ConverterError> {
    match warnings {
        [] => Ok(None),
        [warning] => Ok(Some(*warning)),
        _ => Err(ConverterError::WarningsCountMismatch {
            count: warnings.len(),
        }),
    }
}

impl TryFrom<EMissionMutator> for DeepDiveMutator {
    type Error = ConverterError;

    fn try_from(mutator: EMissionMutator) -> Result<Self, Self::Error> {
        use DeepDiveMutator::*;
        use EMissionMutator::*;

        match mutator {
            MMUT_BloodSugar => Ok(BloodSugar),
            MMUT_ExplosiveEnemies => Ok(VolatileGuts),
            MMUT_LowGravity => Ok(LowGravity),
            MMUT_OxygenRich => Ok(RichAtmosphere),
            MMUT_Weakspot => Ok(CriticalWeakness),
            MMUT_ExterminationContract
            | MMUT_GoldRush
            | MMUT_RichInMinerals
            | MMUT_SecretSecondary
            | MMUT_XXXP => Err(ConverterError::UnexpectedDeepDiveMutator(mutator.into())),
        }
    }
}

fn map_primary_objective_instance(
    obj: ObjectiveInstance,
    duration: Duration,
    complexity: Complexity,
) -> Result<DeepDivePrimaryObjective, ConverterError> {
    use EObjective::*;

    match obj {
        ObjectiveInstance::Elimination {
            kind: OBJ_Eliminate_Eggs,
            targets,
        } => Ok(DeepDivePrimaryObjective::Elimination {
            dreadnought_kinds: targets.into_iter().map(Into::into).collect(),
        }),
        ObjectiveInstance::Other {
            kind: OBJ_1st_DeepScan,
        } => Ok(DeepDivePrimaryObjective::new_deep_scan(
            duration, complexity,
        )),
        ObjectiveInstance::Other {
            kind: OBJ_1st_Escort,
        } => Ok(DeepDivePrimaryObjective::new_escort_duty(
            duration, complexity,
        )),
        ObjectiveInstance::Other {
            kind: OBJ_1st_Extraction,
        } => Ok(DeepDivePrimaryObjective::new_mining_expedition(
            duration, complexity,
        )),
        ObjectiveInstance::Other {
            kind: OBJ_1st_Facility,
        } => Ok(DeepDivePrimaryObjective::new_industrial_sabotage(
            duration, complexity,
        )),
        ObjectiveInstance::Other {
            kind: OBJ_1st_Gather_AlienEggs,
        } => Ok(DeepDivePrimaryObjective::new_egg_hunt(duration, complexity)),
        ObjectiveInstance::Other {
            kind: OBJ_1st_PointExtraction,
        } => Ok(DeepDivePrimaryObjective::new_point_extraction(
            duration, complexity,
        )),
        ObjectiveInstance::Other {
            kind: OBJ_1st_Refinery,
        } => Ok(DeepDivePrimaryObjective::new_on_site_refining(
            duration, complexity,
        )),
        ObjectiveInstance::Other {
            kind: OBJ_1st_Salvage,
        } => Ok(DeepDivePrimaryObjective::new_salvage_operation(
            duration, complexity,
        )),
        ObjectiveInstance::Other {
            kind: OBJ_Excavation_C,
        } => Ok(DeepDivePrimaryObjective::new_heavy_extraction(
            duration, complexity,
        )),
        _ => Err(ConverterError::UnexpectedDeepDivePrimaryObjective(
            obj.objective().into(),
        )),
    }
}

fn map_secondary_objective_instance(
    obj: ObjectiveInstance,
    _duration: Duration,
    _complexity: Complexity,
) -> Result<DeepDiveSecondaryObjective, ConverterError> {
    use DeepDiveSecondaryObjective as Obj;
    use EObjective::*;

    match obj {
        ObjectiveInstance::Elimination {
            kind: OBJ_DD_Elimination_Eggs,
            targets,
        } => Ok(Obj::Elimination {
            dreadnought_kinds: targets.into_iter().map(Into::into).collect(),
        }),
        ObjectiveInstance::Other {
            kind: OBJ_DD_AlienEggs,
        } => Ok(Obj::EggHunt { eggs: 2 }),
        ObjectiveInstance::Other {
            kind: OBJ_DD_DeepScan,
        } => Ok(Obj::DeepScan {
            resonance_crystals: 2,
        }),
        ObjectiveInstance::Other {
            kind: OBJ_DD_Defense,
        } => Ok(Obj::Blackbox { black_boxes: 1 }),
        ObjectiveInstance::Other {
            kind: OBJ_DD_Excavation,
        } => Ok(Obj::HeavyExtraction { resinite_masses: 1 }),
        ObjectiveInstance::Other {
            kind: OBJ_DD_Morkite,
        } => Ok(Obj::MiningExpedition { morkite: 150 }),
        ObjectiveInstance::Other {
            kind: OBJ_DD_MorkiteWell,
        } => Ok(Obj::OnSiteRefining { morkite_wells: 1 }),
        ObjectiveInstance::Other {
            kind: OBJ_DD_RepairMinimules,
        } => Ok(Obj::SalvageOperation { mini_mules: 2 }),
        _ => Err(ConverterError::UnexpectedDeepDiveSecondaryObjective(
            obj.objective().into(),
        )),
    }
}

impl From<EBiome> for Biome {
    fn from(biome: EBiome) -> Self {
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
}

impl TryFrom<EMissionWarning> for DeepDiveWarning {
    type Error = ConverterError;

    fn try_from(warning: EMissionWarning) -> Result<Self, Self::Error> {
        use DeepDiveWarning::*;
        use EMissionWarning::*;

        match warning {
            WRN_BulletHell => Ok(DuckAndCover),
            WRN_CaveLeechDen => Ok(CaveLeechCluster),
            WRN_ExploderInfestation => Ok(ExploderInfestation),
            WRN_Ghost => Ok(HauntedCave),
            WRN_HeroEnemies => Ok(EliteThreat),
            WRN_InfestedEnemies => Ok(Parasites),
            WRN_LethalEnemies => Ok(LethalEnemies),
            WRN_MacteraCave => Ok(MacteraPlague),
            WRN_NoOxygen => Ok(LowOxygen),
            WRN_NoShields => Ok(ShieldDisruption),
            WRN_PitJawColony => Ok(PitJawColony),
            WRN_RegenerativeEnemies => Ok(RegenerativeBugs),
            WRN_RivalIncursion => Ok(RivalPresence),
            WRN_RockInfestation => Ok(EboniteOutbreak),
            WRN_ScrabNestingGrounds => Ok(ScrabNestingGrounds),
            WRN_Swarmagedon => Ok(Swarmageddon),
            WRN_Plague => Err(ConverterError::UnexpectedDeepDiveWarning(WRN_Plague.into())),
        }
    }
}

impl From<EMissionComplexity> for Complexity {
    fn from(complexity: EMissionComplexity) -> Self {
        use EMissionComplexity::*;

        match complexity {
            MD_Complexity_Complex => Complexity::Complex,
            MD_Complexity_Average => Complexity::Average,
            MD_Complexity_Simple => Complexity::Simple,
        }
    }
}

impl From<EMissionDuration> for Duration {
    fn from(duration: EMissionDuration) -> Self {
        use EMissionDuration::*;

        match duration {
            MD_Duration_Long => Duration::Long,
            MD_Duration_Normal => Duration::Normal,
            MD_Duration_Short => Duration::Short,
        }
    }
}

impl From<EDreadnought> for Dreadnought {
    fn from(dreadnought: EDreadnought) -> Self {
        use EDreadnought as From;

        match dreadnought {
            From::Dreadnought => Dreadnought::Classic,
            From::Twins => Dreadnought::Twins,
            From::Hiveguard => Dreadnought::Hiveguard,
        }
    }
}

#[cfg(test)]
mod tests;
