# weekly-route-intel Specification

## Purpose

Defines compact tactical guidance and quick-read ordering for a Deep Dive.

## Requirements

### Requirement: Tactical Summary

Each Deep Dive SHALL receive deterministic short guidance derived from its stages.

#### Scenario: Stage context exists

- **WHEN** a Deep Dive has objectives, warnings, or anomalies (mutators)
- **THEN** the board shows one short tactical sentence for that Deep Dive

#### Scenario: Main threat exists

- **WHEN** a warning or mixed anomaly qualifies as the primary threat
- **THEN** the board identifies that threat and its stage

#### Scenario: Clean Deep Dive

- **WHEN** a Deep Dive has no warning and no anomaly
- **THEN** the guidance stays quiet and does not invent a threat

### Requirement: Threat Priority

Route intel SHALL use explicit domain priorities instead of ad hoc text matching.

#### Scenario: Warning outranks anomaly

- **WHEN** a high-risk warning and an anomaly both appear
- **THEN** the warning is selected as the primary threat

#### Scenario: Mixed anomaly can matter

- **WHEN** `BloodSugar` appears without a stronger warning
- **THEN** it may be selected as the primary concern

#### Scenario: Beneficial anomaly is not a threat

- **WHEN** `CriticalWeakness` appears without a warning
- **THEN** it can influence positive guidance but is not labeled as the main threat

### Requirement: Objective Context

Route intel SHALL account for the objective slot and stage shape.

#### Scenario: Same family in different slots

- **WHEN** an objective family appears as both primary and secondary, such as `DeepScan` or `OnSiteRefining`
- **THEN** route intel treats the primary and secondary variants as different stage contexts

#### Scenario: Hazard depends on stage shape

- **WHEN** a warning interacts strongly with the objective, such as `LowOxygen` on long-travel objectives or `DuckAndCover` on exposed objectives
- **THEN** the tactical sentence reflects that interaction

### Requirement: Quick Read

Quick-read chips SHALL summarize warning and anomaly inventory without duplicating stage details.

#### Scenario: Hazards are present

- **WHEN** a Deep Dive contains warnings or anomalies
- **THEN** quick-read chips list each unique warning or anomaly once, with warnings before anomalies

#### Scenario: No hazards are present

- **WHEN** a Deep Dive has no warnings and no anomalies
- **THEN** quick-read shows a quiet clean-read chip

### Requirement: Drift Coverage

Objective, warning, anomaly, and objective sub-value additions SHALL require intel model updates.

#### Scenario: Contract gains a domain value

- **WHEN** the weekly contract adds a new domain value used by route intel
- **THEN** type checks or tests fail until the intel model and user-facing labels are updated

#### Scenario: Intel logic changes

- **WHEN** threat selection, objective context, or quick-read ordering changes
- **THEN** focused tests cover the changed behavior
