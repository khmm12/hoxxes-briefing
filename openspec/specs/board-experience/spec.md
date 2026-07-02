# board-experience Specification

## Purpose

Defines the visible behavior of the Hoxxes Briefing board.

## Requirements

### Requirement: Board Content

The app SHALL make the current Deep Dive and Elite Deep Dive readable as the primary screen.

#### Scenario: Briefing is available

- **WHEN** the current briefing is available
- **THEN** the board shows reset timing, freshness, and the `Hoxxes Briefing` brand
- **AND** both Deep Dives show name, biome, three stages, primary objective, secondary objective, warning, and anomaly (mutator)

#### Scenario: Normal Deep Dive remains first-class

- **WHEN** both Deep Dives are rendered
- **THEN** the normal Deep Dive exposes the same structure as Elite Deep Dive and is not visually demoted

### Requirement: Responsive Readability

The board SHALL stay compact and readable on desktop and mobile.

#### Scenario: Desktop comparison

- **WHEN** the viewport can fit both Deep Dives side by side
- **THEN** the board supports quick comparison between them

#### Scenario: Mobile reading

- **WHEN** the viewport is narrow
- **THEN** timing, freshness, dive identity, and stage details remain readable without excessive chrome before the board

### Requirement: Freshness And Empty States

The app SHALL distinguish live, refreshing, cached, stale, offline, failed, loading, and not-found states without hiding useful briefing data.

#### Scenario: Background refresh

- **WHEN** a board is visible and refresh is in progress
- **THEN** the board remains visible and only freshness copy or refresh controls change

#### Scenario: Cached or stale briefing

- **WHEN** cached briefing data is shown
- **THEN** the UI makes its freshness clear, including expired-briefing semantics when applicable

#### Scenario: No briefing is available

- **WHEN** loading, offline-empty, fetch-failed, runtime-error, or not-found state has no usable briefing
- **THEN** the app shows a focused state screen with an appropriate recovery action when one exists

### Requirement: App Update Surface

The app SHALL show PWA update availability separately from briefing freshness.

#### Scenario: Update available online

- **WHEN** a PWA update is available and the browser is online
- **THEN** the app shows a compact update action that does not obscure board content

#### Scenario: Offline update state

- **WHEN** the browser is offline
- **THEN** the update prompt is hidden until it can be acted on

### Requirement: User-Facing Copy

All user-facing board, state, timing, refresh, and update copy SHALL be localized and written in product language.

#### Scenario: New copy is added

- **WHEN** visible product copy is added or changed
- **THEN** it goes through Lingui
- **AND** it avoids implementation terms such as API, payload, service worker, or cache in primary UI copy
