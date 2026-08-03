use crate::{Complexity, Duration, MISSION_COUNT};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConverterError {
    #[error("unexpected primary deep dive objective: `{0}`")]
    UnexpectedDeepDivePrimaryObjective(&'static str),

    #[error(
        "invalid primary deep dive objective configuration for `{objective}`: duration={duration:?}, complexity={complexity:?}"
    )]
    InvalidPrimaryObjectiveConfiguration {
        objective: &'static str,
        duration: Duration,
        complexity: Complexity,
    },

    #[error("unexpected secondary deep dive objective: `{0}`")]
    UnexpectedDeepDiveSecondaryObjective(&'static str),

    #[error("only expected 1 secondary objective, but was given {count}")]
    SecondaryObjectivesCountMismatch { count: usize },

    #[error("unexpected deep dive mutator: `{0}`")]
    UnexpectedDeepDiveMutator(&'static str),

    #[error("only expected at most 1 mutator, but was given {count}")]
    MutatorsCountMismatch { count: usize },

    #[error("unexpected deep dive warning: `{0}`")]
    UnexpectedDeepDiveWarning(&'static str),

    #[error("elimination objective must contain at least one dreadnought")]
    EmptyDreadnoughts,

    #[error("only expected at most 1 warning, but was given {count}")]
    WarningsCountMismatch { count: usize },

    #[error("only expected to have {MISSION_COUNT} missions, but was given {count}")]
    MissionsCountMismatch { count: usize },
}

#[cfg(test)]
mod tests;
