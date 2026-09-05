# Hoxxes Briefing — Domain Language

The team glossary for the Deep Rock Galactic (DRG) Deep Dive domain this app
surfaces. Official DRG wiki terms are the reference; where we deliberately
deviate, the reason is stated. This file is the *language*, not the catalogue —
for the exhaustive game reference (every biome, warning, anomaly, and the
wire-enum mapping) see [docs/domain.md](docs/domain.md).

The aggregate root is the **Briefing**:

> Briefing → Deep Dive (normal | elite) → Mission (at Stage 1–3) → Objective
> (primary + secondary) + Mutator (Warning | Anomaly)

## The Briefing

**Briefing**:
The current, time-boxed set of Deep Dives the app serves — the two dives plus
when the set was released and when it expires. The aggregate root; a new
Briefing is issued each Reset. A real domain word (the briefing a player reads),
not a coined label — so it legitimately names the concept at both ends: the
aggregate the API serves and the page the reader opens (`pages/briefing`, per
FSD). "Briefing" is likewise the canonical qualifier for whatever derives from
that data — the query that fetches it, the view-state that drives its screen.
_Avoid_: Weekly (that's cadence, and DRG already uses "Weekly" for Assignments),
Snapshot (not the Briefing data, nor its shared/exported text rendering —
sharing the Briefing is a verb, it produces no separately-named noun), Rotation,
Current Deep Dives; naming the data, query, or view-state "board".

**Reset**:
The cadence event that replaces the current Briefing with a new one (Thursdays,
11:00 UTC). Before Reset every player sees the same Briefing; after, the previous
one is gone.
_Avoid_: rotation tick, refresh, weekly reset.

## Deep Dives

**Deep Dive** / **Dive**:
One of the two dives in a Briefing — a fixed sequence of three Missions played
back-to-back, shared by all players until Reset.
_Avoid_: **Route** — a dive is not a "route"; Route was a presentation-layer
synonym and is retired.

**Elite Deep Dive**:
The harder of the two dives, with higher-hazard stages. Runs beside the normal
Deep Dive; neither is secondary to the other in the product.
_Avoid_: Hard Deep Dive.

**Dive kind**:
The discriminator naming which dive it is — `normal` or `elite`.
_Avoid_: Route kind.

## Missions & Stages

Two distinct, both-official concepts — do not collapse them.

**Mission**:
One of the three activities in a Deep Dive, each carrying its objectives. The
unit you play (the wiki numbers them Mission 1/2/3). Distinct from a normal-map
mission only by living inside a Deep Dive; distinct from an **Assignment**, which
is a meta-chain built *from* missions and which the app does not model.
_Avoid_: using "Stage" to mean the unit.

**Stage**:
The ordinal position — 1, 2, 3 — a Mission occupies in the sequence; difficulty
rises per stage.
_Avoid_: using "Mission" to mean the position.

**Primary objective**:
The main job of a Mission — sets its cave shape, pacing, and extraction.

**Secondary objective**:
The mandatory smaller job in the same Mission. A secondary that shares a mission
type with a primary reuses that noun (a secondary "Morkite", "Dreadnought",
"Resinite Mass"…). The one secondary-only objective is the Black Box.
_Avoid_: side objective, bonus objective.

## Objective Names

Canonical objective nouns. Where a short label is common but incomplete, the
full official noun is the canonical term and the short form is acceptable only
as a compact label.

**Deep Scan**:
The scan objective — connect scanners to Resonance Crystals, ride the
Drillevator, then extract. The objective's canonical label is the task noun
"Deep Scan" (the in-game HUD counts "Deep Scans 2/3"), not the object it
targets — the one objective we label by task rather than by its object.
_Avoid_: **Crystal Scan** — not a DRG term; the game says "Deep Scan".

**Resonance Crystal**:
The object a Deep Scan targets — the crystals you scan. The *task* is Deep Scan;
the *object* is Resonance Crystal.

**Morkite** / **Aquarq**:
Objects of a Mining Expedition and a Point Extraction. Official, use as-is.

**Alien Egg**:
The object of an Egg Hunt.
_Avoid_: "Egg" as the canonical noun (fine as a short label).

**Mini M.U.L.E.**:
The salvage target of a Salvage Operation (which also involves an Uplink and a
Drop Pod holdout).
_Avoid_: "Mule" as the canonical noun (fine as a short label).

**Liquid Morkite Well**:
The refining point of an On-Site Refining mission.
_Avoid_: dropping "Liquid" when precision matters; "Morkite Well" is acceptable shorthand.

**Resinite Mass**:
The object of a Heavy Extraction mission — dug free and sent up with Lift
Rockets. Same noun whether it appears as a primary or a secondary objective.

**Drilldozer** / **Ommoran Heartstone**:
The escort target and the final extraction target of an Escort Duty mission —
its objective nouns.
_Avoid_: naming the objective only "Escort Duty" (that is the mission type, not the objective noun).

**Data Rack**:
The stolen final objective of an Industrial Sabotage mission (recovered after
defeating the Caretaker).
_Avoid_: naming the objective only "Industrial Sabotage" (mission type, not the objective noun).

**Black Box**:
The object of a secondary Black Box job — repaired and held inside its active
radius. The one secondary objective with no primary counterpart.

## Dreadnought Variants

An Elimination objective names which dreadnought bosses spawn. Officially all
three are Glyphid Dreadnoughts; we call the plain original **Classic** because
the game gives it no disambiguating suffix — it shipped first, and Hiveguard and
Twins were added later.

**Dreadnought**:
The objective noun of an Elimination mission (the boss you kill), and the DRG
species name.

**Classic**:
The standard, original Glyphid Dreadnought — armor-shell timing and direct boss
pressure.
_Avoid_: bare "Dreadnought" for this variant — it collides with the objective
noun and the species. Official "Glyphid Dreadnought" is the reference; we keep
Classic to disambiguate from Hiveguard and Twins.

**Hiveguard**:
Dreadnought variant with Sentinel adds and phased vulnerability. Official:
Glyphid Dreadnought Hiveguard.

**Twins**:
Paired Lacerator and Arbalest fight with split melee and ranged pressure.
Official: Glyphid Dreadnought Twins.

## Mission Modifiers

**Mutator**:
The umbrella term for any non-standard mission modifier; every mutator is either
a Warning or an Anomaly. A modifier shown on a Mission is a Mutator.
_Avoid_: **Hazard** for a shown modifier (Hazard is the difficulty tier, below);
using "Mutator" to mean only the neutral/beneficial ones (those are Anomalies).

**Warning**:
A harmful modifier that raises difficulty (Regenerative Bugs, Elite Threat,
Mactera Plague…). Adds hazard bonus.

**Anomaly**:
A neutral or beneficial modifier with no difficulty penalty — Volatile Guts,
Rich Atmosphere, Critical Weakness, Blood Sugar, Low Gravity.
_Avoid_: Mutator (that's the umbrella, Anomaly is the subtype).

**Severity**:
The single ordering of Mutators by how much they should command the reader's
attention. It drives the Rundown chip order; Warnings outrank Anomalies on the
ladder — a product expectation, not a coincidence of numbers.
_Avoid_: "risk" (Anomalies carry severity too, without being risks).

**Hazard**:
DRG's difficulty tier (Hazard 3, 3.5, 5…). The app does not carry or display a
hazard level — it is not part of the Briefing data. Do not reuse "hazard" as a
synonym for a shown Mutator.

**Difficulty**:
The four-level assessment of how demanding a Stage or Deep Dive is for each Crew
profile, relative to its Dive kind. **Easy** has no material Pressure,
**Manageable** is handled through ordinary competent play, **Demanding** requires
deliberate adaptation or coordination, and **Brutal** lets Pressure dictate play
and creates serious failure risk; Objective and Mutator context can outweigh
Stage position.
_Avoid_: Severity (that ranks Mutator attention), Hazard (the game's difficulty
tier).

**Workload**:
The time and resources needed to complete a Stage's Objectives. Workload does
not raise Difficulty unless it interacts with Pressure.
_Avoid_: Difficulty, Pressure.

**Resource runway**:
The qualitative carried-resource state with which the Reference Crew enters a
Stage. **Fresh** starts the Dive with full health and ammunition but no banked
Nitra, **Banked** means earlier Stages plausibly leave a usable reserve, and
**Contested** means established Pressure competes for or is likely to consume
that reserve. Intel folds this state through the Dive in Stage order without
claiming an exact inventory that the Briefing cannot observe.
_Avoid_: a monotonic Stage-position bonus, guessed Nitra totals.

**Pressure**:
A gameplay constraint that limits execution, demands a specific response, or
creates a failure window. Pressure can come from Objectives, Mutators, or their
interaction.
_Avoid_: Workload, Difficulty (the resulting assessment).

**Objective Commitment**:
What a Crew risks by disengaging from an active Objective. Depending on the
Objective, disengaging can drain progress toward mission failure, reset a
retryable attempt, pause progress until repair, expose a target to permanent
damage, or merely prolong an open fight. Commitment describes the consequence,
not whether miners are physically free to move.
_Avoid_: fixed-position, Objective Difficulty.

**Oxygen topology**:
The Stage-level distribution and mobility of oxygen sources under Low Oxygen.
It is derived from the primary Objective's infrastructure plus any local source
added by the secondary Objective. It describes one combined Stage, not separate
primary and secondary assessments.
_Avoid_: "M.U.L.E. mission", treating Objective slots as independent missions.

**Sugar access**:
Whether enemies killed under Blood Sugar leave healing close enough to the
miners who need it. A defence with local kills can make Blood Sugar favorable;
travel, search, and hauling can separate miners from the drops even when the
Stage has many enemies.
_Avoid_: using global kill count without considering where the sugar drops.

**Crew profile**:
The crew-size lens used to assess Difficulty: **Small Crew** is one or two
miners, while **Full Crew** is three or four. It captures differences in
execution capacity, including the ability to split objectives, but not class,
build, or player skill.
_Avoid_: treating one party size as the universal difficulty baseline.

**Reference crew**:
The player-skill baseline behind Difficulty: promoted miners who understand
mission mechanics and coordinate competently, without assuming optimized builds,
practiced comms, or graybeard execution. Crew profiles vary headcount, not this
baseline.
_Avoid_: average players, ideal team.

**Counterplay**:
A deliberate tactic, class choice, or build choice that mitigates Pressure.
Counterplay can explain how to make a Stage easier, but class- or build-specific
Counterplay does not lower the class-agnostic Difficulty assessment. Requiring a
separate plan is itself evidence for `Demanding`.
_Avoid_: assuming the Briefing knows the Crew's composition or loadout.

## Geography

**Biome**:
A cave region that sets a Deep Dive's visual identity, terrain, and hazards
(Crystalline Caverns, Magma Core, Azure Weald…). Full list in
[docs/domain.md](docs/domain.md).

## Presentation

Shared vocabulary for how the domain is rendered — kept deliberately distinct
from the data concepts above.

**Board**:
The assembled first-screen surface that renders a Briefing — the industrial
mission board holding the command rail, dive deck, and footer. A presentation
surface, like Deck and Slab; the view, not the data.
_Avoid_: naming the fetched data, the query, or the derived view-state "board" —
use **Briefing** for those.

**Deck**:
The mobile swipe carousel holding the two dives.
_Avoid_: Route deck.

**Slab**:
The raised card surface that renders one Deep Dive.
_Avoid_: Route slab.

**Intel**:
A concise assessment of how difficult a Deep Dive is relative to its Dive kind.
It summarizes the Dive as a whole and assesses each Stage without generated
commentary.
_Avoid_: Route intel (drop "route").

**Rundown**:
The compressed chip summary of a Deep Dive's mutators (warnings and
anomalies), read at a glance without opening the stages.
_Avoid_: Quick read, scan, route scan.
