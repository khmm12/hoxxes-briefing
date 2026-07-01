# Deep Rock Galactic Domain Reference

Deep Rock Galactic is a cooperative first-person shooter about dwarf miners
working for the Deep Rock Galactic corporation on Hoxxes IV. Players descend
into dangerous procedural caves, mine resources, complete mission objectives,
fight alien bugs and machines, then extract.

This reference covers the weekly Deep Dive rotation: Deep Dives, stages, biomes,
objectives, warnings, anomalies (mutators), and reset timing.

This is the game reference catalogue. For the team's ubiquitous language —
canonical terms, deliberate deviations, and terms to avoid — see
[CONTEXT.md](../CONTEXT.md). Where an app label diverges from the official noun
(e.g. "Crystal Scan" vs. Resonance Crystal), CONTEXT.md is the arbiter.

## Deep Dives

A Deep Dive is a fixed weekly sequence of three pre-seeded missions played
back-to-back. Every player sees the same Deep Dive for the week. Health, ammo,
gold, and nitra carry across the three stages, so early mistakes can matter
later.

Each stage has:

- one primary objective
- one required secondary objective
- optional warning
- optional anomaly (mutator)

Deep Rock Galactic has two Deep Dives each week:

| Deep Dive | Meaning |
| --- | --- |
| Deep Dive | The normal weekly Deep Dive. Its stages are Hazard 3, 3.5, and 3.5. |
| Elite Deep Dive | A separate harder weekly Deep Dive. Its stages are Hazard 4.5, 5, and 5.5. |

## Weekly Rotation

Deep Dives reset once a week. When the reset happens, the normal Deep Dive and
Elite Deep Dive both receive new names, biomes, stages, objectives, warnings,
and anomalies (mutators).

The timer matters because the whole board changes at once. Before reset, players
are looking at the same fixed Deep Dives. After reset, the previous Deep Dives
are gone and the new weekly pair becomes the current one.

## Biomes

Biomes are cave regions. They affect visual identity, terrain, hazards, and the
general feel of a mission.

| Name | Description | Enum |
| --- | --- | --- |
| Crystalline Caverns | Crystal-heavy cave region. | `CrystallineCaverns` |
| Fungus Bogs | Damp fungal cave region. | `FungusBogs` |
| Magma Core | Volcanic cave region with heat and unstable ground. | `MagmaCore` |
| Radioactive Exclusion Zone | Irradiated cave region. | `RadioactiveExclusionZone` |
| Dense Biozone | Lush cave region with dense organic growth. | `DenseBiozone` |
| Sandblasted Corridors | Sandy cave region with wide, eroded spaces. | `SandblastedCorridors` |
| Salt Pits | Salt-crystal cave region. | `SaltPits` |
| Glacial Strata | Frozen cave region with ice and cold hazards. | `GlacialStrata` |
| Azure Weald | Bioluminescent alien forest cave region. | `AzureWeald` |
| Hollow Bough | Thorny, hostile root cave region. | `HollowBough` |
| Ossuary Depths | Bone-strewn cave region. | `OssuaryDepths` |

## Stage Objectives

Every Deep Dive stage has two required jobs. The primary objective is the main
mission: it decides the cave shape, pacing, and extraction rhythm. The secondary
objective is also mandatory, but it is usually a smaller job folded into that
stage.

Some names can appear in both places and still mean different things. A primary
Crystal Scan is the full Deep Scan mission with scanners, the Drillevator, the
geode, and the upward extraction. A secondary Crystal Scan is only the shorter
scan task. A primary On-site Refining stage is the full refinery and pipeline
mission. A secondary Morkite Well is a short one-well hookup. Resinite Mass
extraction is Heavy Extraction whether it appears as the full primary mission or
as the smaller secondary job — DRG has no separate "Heavy Excavation" mission.

## Primary Objectives

| Name | Description | Enum |
| --- | --- | --- |
| Crystal Scan xN | Find resonance crystals, connect scanners, ride and defend the Drillevator, collect Morkite Seeds in the geode, then extract upward. | `DeepScan` |
| Escort Duty | Escort and repair the Drilldozer, handle a Deep Dive refuel stop, defend the Heartstone fight, recover the core, then extract. | `EscortDuty` |
| Morkite xN | Traverse a linear cave, mine the Morkite quota, deposit it, and return through the cave to extract. | `MiningExpedition` |
| Industrial Sabotage | Hack two power stations, drop the force field, defeat the Caretaker boss, recover the Data Rack, then extract. | `IndustrialSabotage` |
| Egg xN | Locate eggs in cave walls and pull them out. Egg pulls can trigger enemy waves, so the team controls when pressure spikes. | `EggHunt` |
| Aquarq xN | Collect heavy Aquarqs from an open cave and deposit them at the Minehead while enemy pressure increases over time. | `PointExtraction` |
| Morkite Well xN | Build pipelines from the refinery to Liquid Morkite wells, start refining, repair pipeline breaks, then extract. | `OnSiteRefining` |
| Mule xN | Repair Mini M.U.L.E.s, then survive uplink and fuel-cell holdouts around fixed zones. | `SalvageOperation` |
| Dreadnought xN | Break dreadnought cocoons and defeat the listed boss variants. | `Elimination` |
| Resinite Mass xN | Find large Resinite Masses, dig them free, attach Lift Rockets, send them up, then extract. | `HeavyExtraction` |

## Secondary Objectives

| Name | Description | Enum |
| --- | --- | --- |
| Egg xN | Collect a smaller required egg quota. It can still add enemy pressure to the primary objective. | `EggHunt` |
| Crystal Scan xN | Perform the shortened scan requirement only; it does not include the Drillevator or Morkite Seed geode flow. | `DeepScan` |
| Black Box | Find, repair, and recover one Black Box by staying inside its active radius. It behaves like a compact holdout. | `Blackbox` |
| Dreadnought xN | Kill the smaller listed dreadnought quota, normally one boss, inside another stage structure. | `Elimination` |
| Morkite xN | Collect a smaller Morkite quota while completing the primary objective. | `MiningExpedition` |
| Morkite Well xN | Connect one well to a small Morkite Extraction Pod. This is not the full refinery mission loop. | `OnSiteRefining` |
| Mule xN | Repair the required Mini M.U.L.E.s without the full uplink and fuel-cell finale. | `SalvageOperation` |
| Resinite Mass xN | Extract a smaller Resinite quota, usually one mass, using Lift Rockets. | `HeavyExcavation` |

The secondary `HeavyExcavation` enum is a non-canonical internal name: DRG has no
"Heavy Excavation" mission, and every other objective that appears in both places
(`DeepScan`, `EggHunt`, `Elimination`, `MiningExpedition`, `OnSiteRefining`,
`SalvageOperation`) shares one enum key across primary and secondary. Rename
candidate: `HeavyExtraction`.

## Dreadnought Values

`Elimination` objectives name the boss variants that appear in the stage.

| Name | Description | Enum (wire) |
| --- | --- | --- |
| Classic | Standard Glyphid Dreadnought with armor-shell timing and direct boss pressure. | `Dreadnought` |
| Hiveguard | Dreadnought variant with Sentinel adds and phased vulnerability. | `Hiveguard` |
| Twins | Paired Lacerator and Arbalest fight with split melee and ranged pressure. | `Twins` |

Officially all three are Glyphid Dreadnoughts; the standard one has no
disambiguating suffix. We name it `Classic` in our domain model (see
[CONTEXT.md](../CONTEXT.md)); the wire tag stays `Dreadnought` for
backward-compatibility.

## Warnings

Warnings are harmful mission modifiers. They make a stage more dangerous or
change what players must respect during the run.

| Name | Description | Enum |
| --- | --- | --- |
| Regenerative Bugs | Damaged enemies recover health after a short time without taking damage. | `RegenerativeBugs` |
| Elite Threat | Elite enemy variants can spawn with stronger stats and altered behavior. | `EliteThreat` |
| Mactera Plague | Airborne Mactera become a larger part of the enemy pressure. | `MacteraPlague` |
| Ebonite Outbreak | Ebonite enemies periodically appear and are countered with supplied power-attack canisters. | `EboniteOutbreak` |
| Duck and Cover | Long-ranged enemies spawn much more often. Cover and sightlines matter more. | `DuckAndCover` |
| Cave Leech Cluster | Cave Leeches are much more common, making ceilings and vertical spaces more dangerous. | `CaveLeechCluster` |
| Low Oxygen | Players must refill oxygen from anchors such as M.U.L.E., resupplies, Minehead, refinery, Drillevator, or Black Box. | `LowOxygen` |
| Exploder Infestation | Packs of Glyphid Exploders rush the team outside normal swarm pressure. | `ExploderInfestation` |
| Haunted Cave | An invulnerable Unknown Horror pursues players for the mission. | `HauntedCave` |
| Lethal Enemies | Enemy melee damage is greatly increased. | `LethalEnemies` |
| Shield Disruption | Personal shields are disabled, with incoming damage adjusted by the game. | `ShieldDisruption` |
| Parasites | Many killed enemies release small parasites. | `Parasites` |
| Swarmageddon | Glyphid Swarmers spawn frequently in extra packs. | `Swarmageddon` |
| Rival Presence | Rival tech enemies, turrets, and possible Nemesis pressure appear. | `RivalPresence` |
| Pit-Jaw Colony | Burrowed Ossiran Pit Jaws create stationary ambush threats that can grab players. | `PitJawColony` |
| Scrab Nesting Grounds | Ossiran Scrabs and nests add frequent small-pack pressure. | `ScrabNestingGrounds` |

## Anomalies (Mutators)

Anomalies are nonstandard mission modifiers that are neutral or beneficial and
add no difficulty (no hazard bonus).

Officially, **Mutator** is the umbrella term and splits into two subtypes:
**Warnings** (harmful, above) and **Anomalies** (neutral/beneficial, below). The
code enum for this category is named `DeepDiveMutator`/`mutator`, but it holds
exactly the Anomalies — a misnomer for `Anomaly`. See [CONTEXT.md](../CONTEXT.md).

| Name | Description | Enum |
| --- | --- | --- |
| Volatile Guts | Killed enemies explode, damaging nearby bugs and players and enabling chain reactions. | `VolatileGuts` |
| Rich Atmosphere | Players move much faster. | `RichAtmosphere` |
| Critical Weakness | Weakpoint hits deal greatly increased damage, with some exclusions. | `CriticalWeakness` |
| Blood Sugar | Players periodically lose health, while enemy kills drop Red Sugar. | `BloodSugar` |
| Low Gravity | Lower gravity changes jumping, falling, projectiles, and movement feel. | `LowGravity` |

## Sources

- Enum source: [packages/contracts/src/schema/weekly.ts](../packages/contracts/src/schema/weekly.ts)
- Official Deep Rock Galactic Wiki: [Deep Rock Galactic](https://deeprockgalactic.wiki.gg/wiki/Deep_Rock_Galactic)
- Official Deep Rock Galactic Wiki: [Deep Dives](https://deeprockgalactic.wiki.gg/wiki/Deep_Dives)
- Official Deep Rock Galactic Wiki: [Missions](https://deeprockgalactic.wiki.gg/wiki/Missions)
- Official Deep Rock Galactic Wiki: [Warnings and Anomalies](https://deeprockgalactic.wiki.gg/wiki/Warning)
