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
Snapshot, Rotation, Current Deep Dives; naming the data, query, or view-state
"board".

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

**Resonance Crystal**:
The object of a Deep Scan mission — the crystals you scan. The *task* is "Deep
Scan"; the *object* is Resonance Crystal.
_Avoid_: **Crystal Scan** — not a DRG term.

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

**Hazard**:
DRG's difficulty tier (Hazard 3, 3.5, 5…). The app does not carry or display a
hazard level — it is not part of the Briefing data. Do not reuse "hazard" as a
synonym for a shown Mutator.

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
The short strategic guidance note for a Deep Dive.
_Avoid_: Route intel (drop "route").

**Quick read**:
The compressed chip summary of a Deep Dive's mutators and warnings.
_Avoid_: Scan, route scan.
