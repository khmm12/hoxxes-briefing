use drg_mission_gen_core::{EDreadnought, EObjective, ObjectiveInstance};

use crate::{Complexity, ConverterError, Duration};

#[derive(Debug, Copy, Clone, PartialEq)]
pub enum Dreadnought {
    Classic,
    Hiveguard,
    Twins,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Dreadnoughts(Vec<Dreadnought>);

impl Dreadnoughts {
    pub fn try_new(dreadnoughts: Vec<Dreadnought>) -> Result<Self, ConverterError> {
        if dreadnoughts.is_empty() {
            return Err(ConverterError::EmptyDreadnoughts);
        }

        Ok(Self(dreadnoughts))
    }

    pub fn as_slice(&self) -> &[Dreadnought] {
        &self.0
    }
}

impl TryFrom<Vec<Dreadnought>> for Dreadnoughts {
    type Error = ConverterError;

    fn try_from(dreadnoughts: Vec<Dreadnought>) -> Result<Self, Self::Error> {
        Self::try_new(dreadnoughts)
    }
}

impl IntoIterator for Dreadnoughts {
    type Item = Dreadnought;
    type IntoIter = std::vec::IntoIter<Dreadnought>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl<'a> IntoIterator for &'a Dreadnoughts {
    type Item = &'a Dreadnought;
    type IntoIter = std::slice::Iter<'a, Dreadnought>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum DeepDivePrimaryObjective {
    DeepScan { resonance_crystals: u32 },
    EscortDuty { refuels: u32 },
    MiningExpedition { morkite: u32 },
    IndustrialSabotage { power_stations: u32 },
    EggHunt { eggs: u32 },
    PointExtraction { aquarqs: u32 },
    OnSiteRefining { morkite_wells: u32 },
    SalvageOperation { mini_mules: u32 },
    Elimination { dreadnoughts: Dreadnoughts },
    HeavyExtraction { resinite_masses: u32 },
}

#[derive(Debug, Clone, PartialEq)]
pub enum DeepDiveSecondaryObjective {
    EggHunt { eggs: u32 },
    DeepScan { resonance_crystals: u32 },
    Blackbox { black_boxes: u32 },
    Elimination { dreadnoughts: Dreadnoughts },
    MiningExpedition { morkite: u32 },
    OnSiteRefining { morkite_wells: u32 },
    SalvageOperation { mini_mules: u32 },
    HeavyExtraction { resinite_masses: u32 },
}

enum PrimaryObjectiveInput {
    DeepScan,
    EggHunt,
    Elimination { targets: Vec<EDreadnought> },
    EscortDuty,
    HeavyExtraction,
    IndustrialSabotage,
    MiningExpedition,
    OnSiteRefining,
    PointExtraction,
    SalvageOperation,
}

enum SecondaryObjectiveInput {
    Blackbox,
    DeepScan,
    EggHunt,
    Elimination { targets: Vec<EDreadnought> },
    HeavyExtraction,
    MiningExpedition,
    OnSiteRefining,
    SalvageOperation,
}

enum ClassifiedObjective {
    Primary(PrimaryObjectiveInput),
    Secondary(SecondaryObjectiveInput),
    Unsupported,
}

pub(crate) fn map_primary_objective(
    objective: ObjectiveInstance,
    duration: Duration,
    complexity: Complexity,
) -> Result<DeepDivePrimaryObjective, ConverterError> {
    let source = objective.objective();
    let classified = classify_objective_instance(objective)
        .map_err(|kind| ConverterError::UnexpectedDeepDivePrimaryObjective(kind.into()))?;

    let input = match classified {
        ClassifiedObjective::Primary(input) => input,
        ClassifiedObjective::Secondary(_) | ClassifiedObjective::Unsupported => {
            return Err(ConverterError::UnexpectedDeepDivePrimaryObjective(
                source.into(),
            ));
        }
    };

    map_primary_input(source, input, duration, complexity)
}

pub(crate) fn map_secondary_objective(
    objective: ObjectiveInstance,
) -> Result<DeepDiveSecondaryObjective, ConverterError> {
    let source = objective.objective();
    let classified = classify_objective_instance(objective)
        .map_err(|kind| ConverterError::UnexpectedDeepDiveSecondaryObjective(kind.into()))?;

    let input = match classified {
        ClassifiedObjective::Secondary(input) => input,
        ClassifiedObjective::Primary(_) | ClassifiedObjective::Unsupported => {
            return Err(ConverterError::UnexpectedDeepDiveSecondaryObjective(
                source.into(),
            ));
        }
    };

    use DeepDiveSecondaryObjective as Objective;
    use SecondaryObjectiveInput::*;

    Ok(match input {
        Blackbox => Objective::Blackbox { black_boxes: 1 },
        DeepScan => Objective::DeepScan {
            resonance_crystals: 2,
        },
        EggHunt => Objective::EggHunt { eggs: 2 },
        Elimination { targets } => Objective::Elimination {
            dreadnoughts: map_dreadnoughts(targets)?,
        },
        HeavyExtraction => Objective::HeavyExtraction { resinite_masses: 1 },
        MiningExpedition => Objective::MiningExpedition { morkite: 150 },
        OnSiteRefining => Objective::OnSiteRefining { morkite_wells: 1 },
        SalvageOperation => Objective::SalvageOperation { mini_mules: 2 },
    })
}

fn map_primary_input(
    source: EObjective,
    input: PrimaryObjectiveInput,
    duration: Duration,
    complexity: Complexity,
) -> Result<DeepDivePrimaryObjective, ConverterError> {
    use DeepDivePrimaryObjective as Objective;
    use PrimaryObjectiveInput::*;

    let invalid_configuration = || ConverterError::InvalidPrimaryObjectiveConfiguration {
        objective: source.into(),
        duration,
        complexity,
    };

    match input {
        DeepScan => match (duration, complexity) {
            (Duration::Short, Complexity::Average) => Ok(Objective::DeepScan {
                resonance_crystals: 3,
            }),
            (Duration::Normal, Complexity::Average) => Ok(Objective::DeepScan {
                resonance_crystals: 5,
            }),
            _ => Err(invalid_configuration()),
        },
        EggHunt => match (duration, complexity) {
            (Duration::Short, Complexity::Simple) => Ok(Objective::EggHunt { eggs: 4 }),
            (Duration::Normal, Complexity::Average) => Ok(Objective::EggHunt { eggs: 6 }),
            (Duration::Long, Complexity::Average) => Ok(Objective::EggHunt { eggs: 8 }),
            _ => Err(invalid_configuration()),
        },
        Elimination { targets } => Ok(Objective::Elimination {
            dreadnoughts: map_dreadnoughts(targets)?,
        }),
        EscortDuty => match (duration, complexity) {
            (Duration::Normal, Complexity::Average | Complexity::Complex) => {
                Ok(Objective::EscortDuty { refuels: 1 })
            }
            (Duration::Long, Complexity::Average | Complexity::Complex) => {
                Ok(Objective::EscortDuty { refuels: 2 })
            }
            _ => Err(invalid_configuration()),
        },
        HeavyExtraction => match (duration, complexity) {
            (Duration::Normal, Complexity::Average | Complexity::Complex) => {
                Ok(Objective::HeavyExtraction { resinite_masses: 3 })
            }
            (Duration::Long, Complexity::Average | Complexity::Complex) => {
                Ok(Objective::HeavyExtraction { resinite_masses: 4 })
            }
            _ => Err(invalid_configuration()),
        },
        IndustrialSabotage => Ok(Objective::IndustrialSabotage { power_stations: 2 }),
        MiningExpedition => match (duration, complexity) {
            (Duration::Short, Complexity::Simple) => {
                Ok(Objective::MiningExpedition { morkite: 200 })
            }
            (Duration::Normal, Complexity::Simple) => {
                Ok(Objective::MiningExpedition { morkite: 225 })
            }
            (Duration::Normal, Complexity::Average) => {
                Ok(Objective::MiningExpedition { morkite: 250 })
            }
            (Duration::Long, Complexity::Average) => {
                Ok(Objective::MiningExpedition { morkite: 325 })
            }
            (Duration::Long, Complexity::Complex) => {
                Ok(Objective::MiningExpedition { morkite: 400 })
            }
            _ => Err(invalid_configuration()),
        },
        OnSiteRefining => Ok(Objective::OnSiteRefining { morkite_wells: 3 }),
        PointExtraction => match (duration, complexity) {
            (Duration::Normal, Complexity::Complex) => {
                Ok(Objective::PointExtraction { aquarqs: 7 })
            }
            (Duration::Long, Complexity::Complex) => Ok(Objective::PointExtraction { aquarqs: 10 }),
            _ => Err(invalid_configuration()),
        },
        SalvageOperation => match (duration, complexity) {
            (Duration::Normal, Complexity::Average) => {
                Ok(Objective::SalvageOperation { mini_mules: 2 })
            }
            (Duration::Long, Complexity::Complex) => {
                Ok(Objective::SalvageOperation { mini_mules: 3 })
            }
            _ => Err(invalid_configuration()),
        },
    }
}

fn classify_objective_instance(
    objective: ObjectiveInstance,
) -> Result<ClassifiedObjective, EObjective> {
    let (source, targets) = match objective {
        ObjectiveInstance::Elimination { kind, targets } => (kind, Some(targets)),
        ObjectiveInstance::Other { kind } => (kind, None),
    };

    use ClassifiedObjective as Objective;
    use EObjective::*;
    use PrimaryObjectiveInput as Primary;
    use SecondaryObjectiveInput as Secondary;

    match source {
        OBJ_1st_DeepScan => {
            classify_without_targets(source, targets, Objective::Primary(Primary::DeepScan))
        }
        OBJ_1st_Escort => {
            classify_without_targets(source, targets, Objective::Primary(Primary::EscortDuty))
        }
        OBJ_1st_Extraction => classify_without_targets(
            source,
            targets,
            Objective::Primary(Primary::MiningExpedition),
        ),
        OBJ_1st_Facility => classify_without_targets(
            source,
            targets,
            Objective::Primary(Primary::IndustrialSabotage),
        ),
        OBJ_1st_Gather_AlienEggs => {
            classify_without_targets(source, targets, Objective::Primary(Primary::EggHunt))
        }
        OBJ_1st_PointExtraction => classify_without_targets(
            source,
            targets,
            Objective::Primary(Primary::PointExtraction),
        ),
        OBJ_1st_Refinery => {
            classify_without_targets(source, targets, Objective::Primary(Primary::OnSiteRefining))
        }
        OBJ_1st_Salvage => classify_without_targets(
            source,
            targets,
            Objective::Primary(Primary::SalvageOperation),
        ),
        OBJ_Eliminate_Eggs => match targets {
            Some(targets) => Ok(Objective::Primary(Primary::Elimination { targets })),
            None => Err(source),
        },
        OBJ_Excavation_C => classify_without_targets(
            source,
            targets,
            Objective::Primary(Primary::HeavyExtraction),
        ),
        OBJ_DD_AlienEggs => {
            classify_without_targets(source, targets, Objective::Secondary(Secondary::EggHunt))
        }
        OBJ_DD_DeepScan => {
            classify_without_targets(source, targets, Objective::Secondary(Secondary::DeepScan))
        }
        OBJ_DD_Defense => {
            classify_without_targets(source, targets, Objective::Secondary(Secondary::Blackbox))
        }
        OBJ_DD_Elimination_Eggs => match targets {
            Some(targets) => Ok(Objective::Secondary(Secondary::Elimination { targets })),
            None => Err(source),
        },
        OBJ_DD_Excavation => classify_without_targets(
            source,
            targets,
            Objective::Secondary(Secondary::HeavyExtraction),
        ),
        OBJ_DD_Morkite => classify_without_targets(
            source,
            targets,
            Objective::Secondary(Secondary::MiningExpedition),
        ),
        OBJ_DD_MorkiteWell => classify_without_targets(
            source,
            targets,
            Objective::Secondary(Secondary::OnSiteRefining),
        ),
        OBJ_DD_RepairMinimules => classify_without_targets(
            source,
            targets,
            Objective::Secondary(Secondary::SalvageOperation),
        ),
        OBJ_1st_Tutorial
        | OBJ_2nd_DestroyBhaBarnacles
        | OBJ_2nd_DestroyEggs
        | OBJ_2nd_Find_ApocaBloom
        | OBJ_2nd_Find_BooloCap
        | OBJ_2nd_Find_Ebonut
        | OBJ_2nd_Find_Fossil
        | OBJ_2nd_Find_Gunkseed
        | OBJ_2nd_KillFleas
        | OBJ_2nd_Mine_Dystrum
        | OBJ_2nd_Mine_Hollomite
        | OBJ_Elimination_Base
        | OBJ_Extraction_Base
        | OBJ_FindItems_Base
        | OBJ_Gather_Gems_Base
        | OBJ_WRN_Plague => classify_without_targets(source, targets, Objective::Unsupported),
    }
}

fn classify_without_targets(
    source: EObjective,
    targets: Option<Vec<EDreadnought>>,
    objective: ClassifiedObjective,
) -> Result<ClassifiedObjective, EObjective> {
    match targets {
        None => Ok(objective),
        Some(_) => Err(source),
    }
}

fn map_dreadnoughts(targets: Vec<EDreadnought>) -> Result<Dreadnoughts, ConverterError> {
    Dreadnoughts::try_new(targets.into_iter().map(map_dreadnought).collect())
}

fn map_dreadnought(dreadnought: EDreadnought) -> Dreadnought {
    match dreadnought {
        EDreadnought::Dreadnought => Dreadnought::Classic,
        EDreadnought::Twins => Dreadnought::Twins,
        EDreadnought::Hiveguard => Dreadnought::Hiveguard,
    }
}

#[cfg(test)]
mod tests;
