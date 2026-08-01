# Deep Rock Galactic Domain Reference

Deep Rock Galactic is a cooperative first-person shooter about dwarf miners
working for the Deep Rock Galactic corporation on Hoxxes IV. Players descend
into dangerous procedural caves, mine resources, complete mission objectives,
fight alien bugs and machines, then extract.

This reference covers Deep Dive content: Deep Dives, stages, biomes,
objectives, warnings, anomalies (mutators), and reset timing.

This is the game reference catalogue. For the team's ubiquitous language —
canonical terms, deliberate deviations, and terms to avoid — see
[CONTEXT.md](../CONTEXT.md). Where an app label diverges from the official noun
(e.g. "Mule" vs. Mini M.U.L.E.), CONTEXT.md is the arbiter.

## Deep Dives

A Deep Dive is a fixed sequence of three pre-seeded missions played
back-to-back. Every player sees the same Deep Dive until reset. Health, ammo,
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
| Deep Dive | The normal Deep Dive. Its stages are Hazard 3, 3.5, and 3.5. |
| Elite Deep Dive | A separate harder Deep Dive. Its stages are Hazard 4.5, 5, and 5.5. |

## Reset

Deep Dives reset once a week. When the reset happens, the normal Deep Dive and
Elite Deep Dive both receive new names, biomes, stages, objectives, warnings,
and anomalies (mutators).

The timer matters because both Deep Dives change at once. Before reset, players
are looking at the same fixed Deep Dives. After reset, the previous Deep Dives
are gone and the new pair becomes the current one.

## Biomes

Biomes are cave regions. They affect visual identity, terrain, hazards, and the
general feel of a mission.

| Name | Description | Enum |
| --- | --- | --- |
| Crystalline Caverns | Open chambers lit by massive crystals — easy to read, but deceptively dangerous. Electrocrystals arc electricity on contact and spider webs snare your movement. | `CrystallineCaverns` |
| Fungus Bogs | Swampy caverns of towering xenofungi platforms. Poison spores and sticky goo that drags at your movement make routing, not raw combat, the real threat. | `FungusBogs` |
| Magma Core | Spacious volcanic caverns of multi-level plateaus and lava. Hot rock burns underfoot, geysers erupt, and quakes slow you to a crawl. | `MagmaCore` |
| Radioactive Exclusion Zone | Desolate open spaces linked by wide tunnels under a sparse, irradiated glow. Volatile Uranium crystals bleed radiation and spider webs snare movement. | `RadioactiveExclusionZone` |
| Dense Biozone | Subterranean rainforest of twisting coral and bioluminescent growth. Ejector cacti, cave urchins, and explosive plants lace the tangled, hazard-rich routes. | `DenseBiozone` |
| Sandblasted Corridors | Soft sandstone desert strewn with giant fossils and little cover. Wind tunnels fling you off course and sandstorms gut visibility while slowing you down. | `SandblastedCorridors` |
| Salt Pits | Big open chambers of red and white salt crystal, barren of vegetation. Unstable ceiling crystals deal massive damage when dislodged and platforms collapse under lingering feet. | `SaltPits` |
| Glacial Strata | Frozen ice caverns where your heat drains toward a hard freeze. Crevasses open underfoot, ice is slick, icicles fall, and blizzards cut visibility. | `GlacialStrata` |
| Azure Weald | Bioluminescent alien jungle of splendor and horror, glowing blue. Strange stone pillars halve damage for dwarves and enemies alike, turning fights into a puzzle. | `AzureWeald` |
| Hollow Bough | Petrified halls of dried grass and towering wood, webbed with red thorns. Parasitic vines wound on contact and choke the routes into tight, dangerous passages. | `HollowBough` |
| Ossuary Depths | Bone-strewn Ossiran depths of sandy ground and wall-hugging rock platforms. Ossiran Scrabs and buried Pit Jaws ambush from the debris, and spider webs snare movement. | `OssuaryDepths` |

## Stage Objectives

Every Deep Dive stage has two required jobs. The primary objective is the main
mission: it decides the cave shape, pacing, and extraction rhythm. The secondary
objective is also mandatory, but it is usually a smaller job folded into that
stage.

Some names can appear in both places and still mean different things. A primary
Deep Scan is the full mission with scanners, the Drillevator, the geode, and the
upward extraction. A secondary Deep Scan is only the shorter scan task. A primary On-site Refining stage is the full refinery and pipeline
mission. A secondary Morkite Well is a short one-well hookup. Resinite Mass
extraction is Heavy Extraction whether it appears as the full primary mission or
as the smaller secondary job — DRG has no separate "Heavy Excavation" mission.

## Primary Objectives

| Name | Description | Enum |
| --- | --- | --- |
| Deep Scan xN | Track down Resonance Crystals with your rangefinder, deploy Scanners to pinpoint the Morkite Geode, then ride the Drillevator down to gather its Morkite Seeds. | `DeepScan` |
| Escort Duty | Escort and repair the Drilldozer to the Ommoran Heartstone, refuel it along the way, then defend the Heartstone dig and extract. | `EscortDuty` |
| Morkite xN | Mine the Morkite quota from the caves and deposit it into the M.U.L.E. | `MiningExpedition` |
| Industrial Sabotage | Hack two guarded power stations to drop the shield, destroy the Caretaker, then extract the stolen data. | `IndustrialSabotage` |
| Egg xN | Pull alien eggs from the cave walls and deposit them — each egg you take can trigger an enemy wave. | `EggHunt` |
| Aquarq xN | Dig Aquarqs out of the walls and haul them to the Minehead while defending against escalating waves. | `PointExtraction` |
| Morkite Well xN | Find the Liquid Morkite wells, run pipelines to the mobile refinery, and keep it patched while it pumps. | `OnSiteRefining` |
| Mule xN | Repair the abandoned Mini M.U.L.E.s, power up the Drop Pod, and hold the uplink until extraction. | `SalvageOperation` |
| Dreadnought xN | Break dreadnought cocoons and defeat the listed boss variants. | `Elimination` |
| Resinite Mass xN | Dig the massive Resinite Masses free, attach Lift Rockets, and send them up to orbit. | `HeavyExtraction` |

## Secondary Objectives

| Name | Description | Enum |
| --- | --- | --- |
| Egg xN | Pull the required alien eggs from the cave walls and deposit them. | `EggHunt` |
| Deep Scan xN | Scan the required Resonance Crystals hidden through the cave. | `DeepScan` |
| Black Box | Find the crashed Black Box on your scanner, repair it, and hold its radius until the download finishes. | `Blackbox` |
| Dreadnought xN | Kill the smaller listed dreadnought quota, normally one boss, inside another stage structure. | `Elimination` |
| Morkite xN | Mine the required Morkite and deposit it into the M.U.L.E. | `MiningExpedition` |
| Morkite Well xN | Hook a Liquid Morkite well up to the extraction pod and pump it dry. | `OnSiteRefining` |
| Mule xN | Repair the required Mini M.U.L.E.s scattered around the stage. | `SalvageOperation` |
| Resinite Mass xN | Free the required Resinite Mass and lift it out with rockets. | `HeavyExtraction` |

Both primary and secondary Resinite Mass objectives use the `HeavyExtraction`
enum key in the domain model, matching every other objective that appears in
both places (`DeepScan`, `EggHunt`, `Elimination`, `MiningExpedition`,
`OnSiteRefining`, `SalvageOperation`), which share one key across primary and
secondary. The legacy `/api/v1/weekly` wire keeps the older secondary tag
`HeavyExcavation` for backward-compatibility; it is disposable and dropped at
endpoint sunset (see [ADR 0001](adr/0001-versioned-wire-migration.md)).

## Dreadnought Values

`Elimination` objectives name the boss variants that appear in the stage.

| Name | Description | Enum |
| --- | --- | --- |
| Classic | Standard Glyphid Dreadnought with armor-shell timing and direct boss pressure. | `Classic` |
| Hiveguard | Dreadnought variant with Sentinel adds and phased vulnerability. | `Hiveguard` |
| Twins | Paired Lacerator and Arbalest fight with split melee and ranged pressure. | `Twins` |

Officially all three are Glyphid Dreadnoughts; the standard one has no
disambiguating suffix. We name it `Classic` in the domain model and on the
`/api/v1/briefing` wire (see [CONTEXT.md](../CONTEXT.md)). The legacy
`/api/v1/weekly` wire keeps the `Dreadnought` tag for backward-compatibility
(disposable; see [ADR 0001](adr/0001-versioned-wire-migration.md)).

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
domain model names this category `DeepDiveAnomaly`/`anomaly`. The legacy
`/api/v1/weekly` wire keeps the older `mutator` field name for
backward-compatibility (disposable; see
[ADR 0001](adr/0001-versioned-wire-migration.md)). See [CONTEXT.md](../CONTEXT.md).

| Name | Description | Enum |
| --- | --- | --- |
| Volatile Guts | Killed enemies explode, damaging nearby bugs and players and enabling chain reactions. | `VolatileGuts` |
| Rich Atmosphere | Players move much faster. | `RichAtmosphere` |
| Critical Weakness | Weakpoint hits deal greatly increased damage, with some exclusions. | `CriticalWeakness` |
| Blood Sugar | Players periodically lose health, while enemy kills drop Red Sugar. | `BloodSugar` |
| Low Gravity | Lower gravity changes jumping, falling, projectiles, and movement feel. | `LowGravity` |

## Sources

- Official Deep Rock Galactic Wiki: [Deep Rock Galactic](https://deeprockgalactic.wiki.gg/wiki/Deep_Rock_Galactic)
- Official Deep Rock Galactic Wiki: [Deep Dives](https://deeprockgalactic.wiki.gg/wiki/Deep_Dives)
- Official Deep Rock Galactic Wiki: [Missions](https://deeprockgalactic.wiki.gg/wiki/Missions)
- Official Deep Rock Galactic Wiki: [Warnings and Anomalies](https://deeprockgalactic.wiki.gg/wiki/Warning)
