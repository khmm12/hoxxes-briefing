# weekly-ui-system Specification

## Purpose

Defines durable web UI implementation boundaries for the weekly board.

## Requirements

### Requirement: Panda Styling Boundary

The web app SHALL express reusable visual decisions through Panda CSS.

#### Scenario: Reused visual value

- **WHEN** color, spacing, radius, shadow, typography, motion, or surface treatment is reused
- **THEN** it is represented through Panda tokens, semantic tokens, recipes, text styles, layer styles, or shared utilities

#### Scenario: Generated styling output

- **WHEN** Panda generates `styled-system`
- **THEN** generated files are not edited by hand

### Requirement: Web Component Boundaries

The web app SHALL keep shared primitives separate from weekly product composition.

#### Scenario: Shared primitive

- **WHEN** UI is reusable infrastructure such as layout, action, icon, state shell, surface, or dock behavior
- **THEN** it may live in `shared/ui`

#### Scenario: Weekly composition

- **WHEN** UI renders Deep Dive meaning, stage data, route intel, or weekly copy
- **THEN** it stays in the weekly page slice

### Requirement: Typography And Icons

The UI system SHALL keep typography and icons predictable across board states.

#### Scenario: Board typography

- **WHEN** the weekly board renders
- **THEN** display roles use the configured display font and dense labels remain readable on mobile

#### Scenario: Generic icon

- **WHEN** a generic icon appears in a control or status element
- **THEN** it defaults to `1em`, uses `currentColor`, and can be styled through the shared UI contract

### Requirement: PWA Assets And Metadata

The web app SHALL keep PWA install assets and metadata in repo-owned, reproducible form.

#### Scenario: Icon assets change

- **WHEN** favicon or install icon assets change
- **THEN** derived raster files are regenerated from repo-owned SVG sources instead of hand-edited or referenced from local machine paths

#### Scenario: App metadata loads

- **WHEN** the app shell and manifest are loaded
- **THEN** they identify the app as `Hoxxes Briefing` and reference generated assets that are included in the production web build

### Requirement: UI Verification

User-visible UI changes SHALL be verified at the scope of their risk.

#### Scenario: Web UI behavior changes

- **WHEN** layout, state screens, offline behavior, route intel, or PWA update UI changes
- **THEN** focused tests and a production web build cover the changed path
