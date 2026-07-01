use super::*;

#[test]
fn display_messages_report_the_offending_variant_details() {
    assert_eq!(
        ConverterError::UnexpectedDeepDivePrimaryObjective("OBJ_2nd_KillFleas").to_string(),
        "unexpected primary deep dive objective: `OBJ_2nd_KillFleas`"
    );
    assert_eq!(
        ConverterError::UnexpectedDeepDiveSecondaryObjective("OBJ_2nd_KillFleas").to_string(),
        "unexpected secondary deep dive objective: `OBJ_2nd_KillFleas`"
    );
    assert_eq!(
        ConverterError::SecondaryObjectivesCountMismatch { count: 2 }.to_string(),
        "only expected 1 secondary objective, but was given 2"
    );
    assert_eq!(
        ConverterError::UnexpectedDeepDiveMutator("MMUT_GoldRush").to_string(),
        "unexpected deep dive mutator: `MMUT_GoldRush`"
    );
    assert_eq!(
        ConverterError::MutatorsCountMismatch { count: 2 }.to_string(),
        "only expected at most 1 mutator, but was given 2"
    );
    assert_eq!(
        ConverterError::UnexpectedDeepDiveWarning("WRN_Plague").to_string(),
        "unexpected deep dive warning: `WRN_Plague`"
    );
    assert_eq!(
        ConverterError::WarningsCountMismatch { count: 2 }.to_string(),
        "only expected at most 1 warning, but was given 2"
    );
    assert_eq!(
        ConverterError::MissionsCountMismatch { count: 5 }.to_string(),
        "only expected to have 3 missions, but was given 5"
    );
}
