# Hoxxes Briefing Product

Hoxxes Briefing is a focused briefing for Deep Rock Galactic players. It
answers one question quickly:

> What are we dealing with this week, and when does it reset?

## Audience

The primary audience is players checking the current Deep Dive and Elite Deep
Dive. Some users only run the normal Deep Dive; others compare both. The normal
Deep Dive must not feel secondary just because Elite is harder.

The app is not a generic dashboard, wiki, marketing site, joke page, archive, or
admin surface.

## The Board

The first screen is the product. It should show:

- current Deep Dive and Elite Deep Dive
- the briefing's start, end, and time remaining
- briefing freshness and availability
- Deep Dive name, biome, and three stages per Deep Dive
- primary objective, secondary objective, warning, and anomaly (mutator) for each stage
- a concise difficulty assessment for each Deep Dive and each Stage

The board should be compact, readable on phones, and easy to scan under pressure.
Timing, mutators, and stage structure are more important than decorative detail.

## Intel

Intel shows how demanding each Deep Dive and Stage is. It is a deterministic
assessment derived from the current Briefing and curated DRG mechanics, not a
prediction personalized to a particular player.

- Assess every Stage and the Dive as `Easy`, `Manageable`, `Demanding`, or
  `Brutal` for a Small Crew (one or two miners) and a Full Crew (three or four).
- Assume promoted players who know the mission mechanics and coordinate
  competently, without assuming optimized builds, practiced comms, or graybeard
  execution.
- Calibrate Difficulty within Dive kind. `Easy` on an Elite Deep Dive means
  easy for an EDD Reference Crew, not equivalent combat safety to `Easy` on a
  normal Deep Dive. Elite Hazard never applies a blanket grade promotion.
  Intel is already scoped to one specific Dive, so it neither compares these
  relative labels across Dive kinds nor adds a redundant Elite qualifier.
- Collapse matching Crew-profile assessments. When they differ, state the
  crew-size condition instead of hiding a universal party-size assumption.
- Take the median of the three Stage assessments independently for each Crew
  profile to obtain the overall Dive assessment.
- Derive assessments from named gameplay interactions, not additive scores.
  Stage position and Hazard never change a grade without a named interaction.
- Let the strongest surviving named rule determine each profile's grade.
  Mitigation removes only the failure mechanism it explicitly counters.
  Unrelated Pressure, secondary floors, and entry-sensitive rules survive.
- Assess Stages from first to third while folding a qualitative Resource runway:
  `Fresh` starts with full health and ammunition but no banked Nitra, `Banked`
  carries a plausible reserve, and `Contested` means established Pressure
  competes for that reserve. The fold is not an exact inventory simulation.
- Keep Resource runway internal. It changes a grade only through an explicit
  entry-sensitive rule. Do not display resource warnings or carried-state labels.
- Keep Workload distinct from Pressure. Extra time or resource use changes
  Difficulty only when a named interaction makes that burden dangerous.
- Class- or build-specific counterplay does not change the assessment.
- Do not change Difficulty from biome alone. The Briefing exposes a biome name,
  not the generated cave geometry needed for an interaction.
- Display grades only. Do not generate advice, causal paragraphs, hotspot
  summaries, favorable-context copy, or confidence badges. Rule rationale stays
  in this calibration and its tests.

### Calibration anchors

- A Warning is evidence, not a Difficulty grade. Deep Dives place at most one
  Warning and one Anomaly on a Stage; context decides whether either materially
  changes play.
- Point Extraction applies continuous time pressure: pressure-wave intervals
  shorten, wave size starts increasing after the tenth wave, and the second
  announced swarm lands at roughly ten minutes. Treat Point Extraction plus a
  secondary Elimination as a coupled time-and-resource constraint because both
  objectives gate the Minehead launch while pressure continues.
- Point Extraction on Stage 1 starts with no banked Nitra, so mining the first
  resupply competes directly with its running clock. A later Point Extraction
  can be easier when a competent Crew carries a reserve from earlier Stages;
  do not infer resource attrition from Stage number alone.
- A larger crew receives scaled enemy pressure but can also split objectives.
  Model that execution-capacity difference through Crew profiles rather than
  pretending player count has no effect.

Clean Stage exit anchors for Resource runway are:

- `Banked`: Mining Expedition, Egg Hunt, Deep Scan, Heavy Extraction, On-site
  Refining, and Industrial Sabotage. Industrial Sabotage consumes ammunition,
  but normally provides abundant Nitra and a long collection window before the
  Caretaker.
- `Contested`: Point Extraction, Elimination, and Salvage Operation, where
  running pressure, a boss, or consecutive defence phases compete for the
  collected reserve.
- Escort Duty is also `Contested`, but with explicit layout uncertainty: its
  Nitra outcome varies materially between caves and cannot be inferred from the
  refuelling count alone.

Warnings and Anomalies may override these clean exits through named
interactions:

- `Duck and Cover` and `Haunted Cave` turn an otherwise `Banked` exit into
  `Contested`; their sustained ammunition or tempo pressure consumes the
  recovery margin. Other Warnings, including Shield Disruption and Mactera
  Plague, do not change the exit without another named interaction.
- Blood Sugar leaves travel- and search-led exits unchanged. It turns Salvage
  Operation into `Banked`, because local defence kills save recovery resources.
- Swarmageddon provides no special Blood Sugar recovery override. Independent
  resource Pressure survives local healing: Duck and Cover or Haunted Cave
  keeps a Blood Sugar Salvage exit `Contested`.

Entry is fixed before assessing the current Stage; its exit feeds the next
Stage and does not retroactively lower its own assessment. No currently accepted
mitigation restores an incoming reserve. Healing and faster hauling cannot
overwrite independent reserve-sensitive Pressure.

Entry runway changes a grade only where a named Objective interaction makes the
incoming reserve immediately consequential. Point Extraction and Escort Duty
have such rules. Industrial Sabotage, Elimination, Salvage Operation, and the
remaining Objectives normally allow a competent Crew to gather local Nitra
before starting their decisive pressure phase. In particular, a Dreadnought
cocoon can remain unopened; a `Contested` entry therefore does not raise a
Classic, Twins, or Hiveguard assessment by itself.

Mechanics reference:
[Point Extraction](https://deeprockgalactic.wiki.gg/wiki/Point_Extraction),
[Swarm](https://deeprockgalactic.wiki.gg/wiki/Enemy_Diversity),
[Difficulty Scaling](https://deeprockgalactic.wiki.gg/wiki/Difficulty_Scaling),
and [Deep Dives](https://deeprockgalactic.wiki.gg/wiki/Deep_Dives).

Objective Commitment must be derived from the actual interruption and failure
mechanic, not from a generic `fixed-position` label:

- An Objective may change Commitment between phases. Phase mechanics provide
  evidence for interactions, but Intel assigns one Difficulty
  grade to the complete Stage; it never grades Uplink, Fuel Cells, Hack-C, or
  another phase as an independent mission.
- Salvage Uplink and Fuel Cell charging require presence in a radius. Emptying
  the progress bar fails the mission.
- A Black Box also requires presence in a radius and loses progress when
  abandoned, but an emptied bar resets the objective for another attempt rather
  than failing the Deep Dive.
- Hack-C has no presence radius. Enemy damage pauses the hack, and repairing the
  bot resumes the saved progress; a displaced transmitter node instead requires
  the connection to be restored.
- Doretta is a moving target with permanently destructible health segments;
  destroying the body fails the mission. A broken Drillevator claw only pauses
  descent until repaired.
- Caretaker and Dreadnought fights are open combat commitments without a
  presence gate or objective timer. Their Pressure comes from attention,
  positioning, and resources.

Mechanics reference:
[Salvage Operation](https://deeprockgalactic.wiki.gg/wiki/Salvage_Operation),
[Black Box](https://deeprockgalactic.wiki.gg/wiki/Black_Box),
[Industrial Sabotage](https://deeprockgalactic.wiki.gg/wiki/Industrial_Sabotage),
[Escort Duty](https://deeprockgalactic.wiki.gg/wiki/Escort_Duty),
[Deep Scan](https://deeprockgalactic.wiki.gg/wiki/Deep_Scan),
[Caretaker](https://deeprockgalactic.wiki.gg/wiki/Caretaker),
and [Elimination](https://deeprockgalactic.wiki.gg/wiki/Elimination).

Deep Dive secondary variants must use their reduced mechanics:

- Mining 150, Eggs 2, one-well On-site Refining, two mini-mules, two Deep
  Scans, and one Resinite Mass add Workload but do not raise Difficulty by
  themselves. Secondary Salvage has no Drop Pod defence, secondary Deep Scan
  has no Drillevator, and secondary On-site Refining uses one well with a small
  extraction pod.
- A Black Box establishes a `Manageable` floor for both Crew profiles.
- A Classic Dreadnought or Twins secondary establishes a `Manageable` floor for
  both profiles; Hiveguard establishes `Demanding` for a Small Crew and
  `Manageable` for a Full Crew.
- These are not additive grades. A secondary changes the primary-derived grade
  through its own floor or a named compound interaction, such as Elimination
  consuming Point Extraction's ratcheting time budget.

Mechanics reference:
[Deep Dive objective variants](https://deeprockgalactic.wiki.gg/wiki/Deep_Dives).

### Golden scenarios

These Stage 1 scenarios establish the initial Objective-only calibration before
Warnings, Anomalies, and Stage-position amplification:

| Objectives | Small Crew | Full Crew | Decisive evidence |
| --- | --- | --- | --- |
| Mining 200 + Eggs 2 | Easy | Easy | Short work with no competing pressure |
| Industrial Sabotage + Morkite 150 | Brutal | Demanding | The Caretaker is the pressure spike; the hacks and extra route primarily extend exposure and resource use |
| Point Extraction 7 + Eggs 2 | Demanding | Easy | A Small Crew spends the ratcheting time budget sequentially; a Full Crew can split the work |
| Point Extraction 10 + Elimination | Brutal | Demanding | The Dreadnought delays Minehead launch while Point Extraction pressure continues; a Full Crew can split collection and combat |

Point Extraction with either seven or ten Aquarqs and an otherwise low-pressure
secondary Objective is Resource-runway-sensitive:

- `Fresh` is `Demanding`/`Easy`: the Crew has full starting ammunition, but
  mining the first resupply competes with the Aquarq clock.
- `Banked` is `Manageable`/`Easy`: a Small Crew can focus immediately on
  Aquarqs, while a Full Crew already parallelizes the quota.
- `Contested` is `Demanding`/`Manageable`: a Full Crew loses some safety when
  the incoming reserve is already needed for recovery.

Ten Aquarqs increase Workload but do not raise these grades. A secondary Elimination or another conflicting Pressure creates a
stronger interaction.

Point Extraction with a secondary Elimination is also
Resource-runway-sensitive:

- `Fresh` is `Brutal`/`Demanding`: the Crew has starting ammunition but must
  mine Nitra while the Dreadnought consumes the Aquarq clock.
- `Banked` is `Demanding`/`Manageable`: an immediate resupply removes the
  resource race, while the Small Crew still performs most work sequentially and
  the Full Crew can split collection from combat.
- `Contested` is `Brutal` for both profiles: the boss and ratcheting waves meet
  a Crew without a dependable recovery reserve.

Point Extraction with a secondary Black Box is a weaker but still named
time-pressure interaction:

- `Fresh` and `Banked` are `Demanding`/`Manageable`: presence defence pauses
  Aquarq collection while the Point Extraction clock keeps ratcheting. A Full
  Crew can split roles; a Small Crew has little spare execution capacity.
- `Contested` is `Brutal`/`Demanding`: retrying or sustaining the defence
  without dependable recovery consumes more of the escalating Point Extraction
  window.

Unlike a Salvage Uplink, an emptied Black Box resets for another attempt rather
than failing the Deep Dive. That retryability keeps this interaction below the
secondary-Elimination rule.

Deep Scan with either three or five scans is `Easy` for both Crew profiles when
paired with an otherwise low-pressure secondary Objective. The longer search is
Workload rather than Pressure, and a clean Drillevator descent is handled
through ordinary mission play.

Escort Duty with either one or two refuelling stops is `Demanding` for a Small
Crew and `Manageable` for a Full Crew on a neutral Stage 1. The decisive
Pressure is the final Heartstone fight, where combat and repairs compete while
Doretta's destroyed health segments cannot be recovered. Additional refuelling
primarily increases Workload and exposure time; it does not raise the grade by
itself.

Escort Duty is Resource-runway-sensitive rather than Stage-position-sensitive.
A `Fresh` or `Banked` entry retains `Demanding`/`Manageable`; a `Contested`
entry becomes `Demanding` for both profiles because a Full Crew loses its
resupply margin before the Heartstone finale. The Small Crew grade is unchanged
because split combat and repair attention is already its bottleneck. Hazard 5.5
does not promote the grade without the contested reserve.

Salvage Operation with either two or three mini-mules is `Manageable` for both
Crew profiles on a neutral Stage 1. Its complete sequence, including Uplink and
Fuel Cell defence, is one Objective assessment: the defence phases create
noticeable but ordinary Pressure, while extra mini-mules primarily add
Workload.

On-site Refining with three wells is `Easy` for both Crew profiles on a neutral
Stage 1. Finding wells, building pipelines, and repairing leaks can make the
Stage long, but the recoverable pipeline loop is Workload rather than material
Pressure.

Egg Hunt with four, six, or eight eggs is `Easy` for both Crew profiles on a
neutral Stage 1. The respective one, two, or three guaranteed swarms are
player-triggered, so a competent Crew can prepare and recover between pulls.
The larger quota primarily increases Workload and resource exposure.

Mechanics reference:
[Egg Hunt](https://deeprockgalactic.wiki.gg/wiki/Egg_Hunt).

Mining Expedition with any supported quota from 200 through 400 Morkite is
`Easy` for both Crew profiles on a clean Stage. A 400-Morkite cave can be very
long, but length alone is Workload. Stage position does not promote it without a
named Pressure interaction.

Heavy Extraction with either three or four Resinite Masses is `Easy` for both
Crew profiles on a clean Stage. Searching, excavating, and attaching Lift
Rockets add Workload, while the Crew controls when each possible launch swarm
can occur. The larger quota does not create material Pressure by itself.

Mechanics reference:
[Heavy Extraction](https://deeprockgalactic.wiki.gg/wiki/Heavy_Extraction).

Elimination distinguishes Hiveguard from the other targets. A single Classic
Dreadnought or Twins encounter is `Manageable` for both Crew profiles, as is a
clean primary pair containing Classic plus Twins. A single Hiveguard or any
primary pair containing Hiveguard is `Demanding` for a Small Crew and
`Manageable` for a Full Crew. A second non-Hiveguard fight adds Workload and
resource use but does not raise the grade without a competing timer or other
Pressure. These grades are unchanged by a `Contested` entry: the Crew controls
when it opens each cocoon and can normally mine local Nitra first.

Haunted Cave is intrinsically Crew-sensitive: it is `Brutal` for a Small Crew
because kiting consumes all or half of its execution capacity, and `Demanding`
for a Full Crew that can dedicate one miner to the Unknown Horror. Another
Pressure mechanism raises the Full Crew assessment only when it competes for
the same remaining execution capacity or binds the Crew to a shared Objective;
mere coexistence is not enough. Actual cave geometry can make kiting worse, but
it is unavailable in the Briefing and must remain explicit residual uncertainty
rather than inferred evidence.

Point Extraction with Haunted Cave is `Brutal` for a Small Crew and `Demanding`
for a Full Crew with either Aquarq quota. Unlike Escort Duty, Point Extraction
has no shared target that requires continuous protection: a Full Crew can
dedicate one miner to kiting while the others keep collecting independently.

On a neutral Stage, `Elite Threat`, `Lethal Enemies`, and `Rival Presence` are
`Manageable`: they are noticeable but ordinary competent play is enough.
`Duck and Cover` and `Shield Disruption` are `Demanding` because they require
deliberate positioning or recovery adaptation. `Low Oxygen` is `Manageable`
when a mobile M.U.L.E. supplies the Crew; its stronger grades depend on Oxygen
topology rather than the Warning name alone. Objective context can raise any of
these assessments.

Other Warnings start from the following neutral Stage calibration:

| Warning | Small Crew | Full Crew |
| --- | --- | --- |
| Mactera Plague | Manageable | Manageable |
| Exploder Infestation | Manageable | Manageable |
| Swarmageddon | Manageable | Manageable |
| Scrab Nesting Grounds | Manageable | Manageable |
| Pit Jaw Colony | Manageable | Manageable |
| Ebonite Outbreak | Easy | Easy |
| Parasites | Easy | Easy |
| Regenerative Bugs | Easy | Easy |
| Cave Leech Cluster | Demanding | Manageable |

`Cave Leech Cluster` is more dangerous than `Pit Jaw Colony`, especially for a
Small Crew: a ceiling grab can remove a miner with little warning, while a Pit
Jaw is stationary and normally presents a more legible rescue problem.
`Ebonite Outbreak` does not create material Pressure on a neutral Stage.
The other `Manageable` Warnings become `Demanding` only when a named interaction
with the Objectives, Crew profile, or Resource runway creates a real failure
window.

`Regenerative Bugs` does not promote Elimination: Dreadnoughts are explicitly
exempt from the Warning's regeneration, so the boss Objective retains its clean
baseline. Ordinary enemies may still extend incidental fights, but that is not
a distinct failure mechanism.

`Swarmageddon` establishes its neutral `Manageable` floor but receives no
Objective-specific promotion from a presence gate, Escort Duty, or the
Drillevator. Its numerous low-health targets are predictable and have broad
area-control Counterplay; a particular Crew lacking that Counterplay may
struggle, but class or build composition does not alter the class-agnostic
grade. Existing Objective and entry-sensitive Pressure still applies. Escort
Duty is `Demanding`/`Manageable` on Fresh or Banked entry and `Demanding` for
both profiles on Contested entry. Point Extraction with a low-pressure
secondary is `Demanding`/`Manageable` on Fresh or Contested entry and
`Manageable` for both profiles on Banked entry.

`Duck and Cover` interacting with a presence-gated Objective is `Demanding`,
not automatically `Brutal`: sustained ranged fire can contest the progress
radius, but a deliberate shelter or bunker is strong Counterplay. Needing that
plan still satisfies `Demanding`, while the class- and build-dependent
Counterplay does not reduce the class-agnostic grade. `Shield
Disruption` and `Exploder Infestation` do not receive the same automatic
interaction; competent range control can keep either from denying the radius.

`Duck and Cover` interacting with Point Extraction is `Brutal` for a Small Crew
and `Demanding` for a Full Crew with either Aquarq quota. Hauling removes the
carrier's ability to shoot while the open Minehead, mixed ranged roster, and
ratcheting waves compete for time. A Full Crew can assign covering fire; a Small
Crew cannot separate hauling from ranged control. `Fresh` and `Banked` entries
retain `Brutal`/`Demanding`: more Nitra sustains covering fire but does not
remove the interaction. A `Contested` entry is `Brutal` for both profiles
because the Full Crew can no longer depend on that ammunition-intensive role.

`Mactera Plague` interacting with a presence-gated Objective is Crew-sensitive.
It raises a Small Crew assessment to `Demanding` because the same one or two
miners must hold progress and control aerial targets; deliberate bunker
Counterplay does not erase that assessment. A Full Crew keeps the Warning's
`Manageable` baseline because it can allocate aerial control without abandoning
the Objective. This interaction does not apply to open Caretaker or Dreadnought
combat, where no presence gate exists.

`Mactera Plague` interacting with Point Extraction is `Demanding` for a Small
Crew and `Manageable` for a Full Crew. Aerial targets interfere with hauling,
but their narrower roster does not create the mixed ranged denial of `Duck and
Cover`; a Full Crew can assign covering fire while a Small Crew retains its
existing Point Extraction time-pressure grade. `Fresh` and `Banked` entries
retain `Demanding`/`Manageable`; a `Contested` entry becomes `Demanding` for
both profiles because the Full Crew can no longer sustain a dedicated
air-control role from a dependable ammunition reserve.

`Mactera Plague` interacting with the Drillevator is a stronger, separate rule:
the constrained moving platform exposes the Crew to aerial attacks from above
while claw repairs compete for attention. The resulting Deep Scan Stage is
`Brutal` for a Small Crew and `Demanding` for a Full Crew. A static bunker is
not normal Counterplay on the descending platform.

`Duck and Cover` interacting with the Drillevator receives the same `Brutal`
Small Crew and `Demanding` Full Crew grades. Its mixed ranged roster adds
Pressure, but does not promote a competent Full Crew to `Brutal` while it can
split claw repairs from ranged control.

Escort Duty distinguishes `Duck and Cover` from `Mactera Plague`. During the
Heartstone fight, `Duck and Cover` produces a `Brutal` Small Crew and
`Demanding` Full Crew Stage because its mixed long-range roster competes with
Doretta repairs and the Heartstone attacks. `Mactera Plague` is narrower and
leaves more room to reposition, producing `Demanding` for a Small Crew and
`Manageable` for a Full Crew on Fresh or Banked entry. Contested entry retains
`Demanding` for both profiles because reserve-sensitive Pressure survives. `Shield Disruption` and `Exploder Infestation`
retain their existing baseline or Objective-derived grade rather than receiving
an Escort-specific promotion.

Mechanics reference:
[Warnings, including the Regenerative Bugs exemptions](https://deeprockgalactic.wiki.gg/wiki/Warning),
[Duck and Cover, and Mactera Plague](https://deeprockgalactic.wiki.gg/wiki/Warning).

`Low Oxygen` is evaluated from the combined Stage's Oxygen topology:

- Point Extraction has no M.U.L.E. and ties oxygen to the fixed Minehead while
  the Aquarq timer ratchets. Its grade follows Resource runway: `Fresh` is
  `Brutal`/`Demanding`, `Banked` is `Demanding`/`Manageable`, and `Contested` is
  `Brutal` for both profiles. Banked Nitra can immediately place permanent
  resupply-based oxygen anchors near distant Aquarqs.
- On-site Refining also has no M.U.L.E. and ties oxygen to the refinery, but has
  no Point Extraction timer. It is `Demanding` for both Crew profiles and
  retains its `Banked` exit. A Crew may spend Nitra on permanent
  resupply-based oxygen anchors near distant wells, but whether those anchors
  are needed depends on pipeline length and cave geometry unavailable to the
  Briefing.
- Other primary Objectives receive the ordinary `Manageable` Low Oxygen
  contribution. In generator-realizable combinations they retain mobile
  M.U.L.E. oxygen. Black Box and Doretta add oxygen at their active Objective;
  neither introduces a promotion.
- The generator bans Low Oxygen with Salvage Operation, but the wire-valid
  combination still receives the ordinary `Manageable` Warning contribution.
  Do not infer mobile oxygen throughout every phase of this synthetic case.
  Blood Sugar may mitigate Salvage defence but does not remove this independent
  Low Oxygen floor.

Primary Objective infrastructure and secondary Objective equipment are combined
before assessing the Stage; Intel never grades them as independent missions.

Mechanics reference:
[Low Oxygen](https://deeprockgalactic.wiki.gg/wiki/Warning#Low_Oxygen) and
[M.U.L.E. availability](https://deeprockgalactic.wiki.gg/wiki/M.U.L.E.).

`Critical Weakness` never changes Difficulty. Dreadnoughts and the Caretaker's
eye are unaffected by the Anomaly, so it cannot mitigate the boss Objectives
whose health budget might otherwise change a grade. Against `Duck and Cover`
and `Mactera Plague`, the decisive Pressure is repeated ranged attention and
position denial rather than individual weakpoint health. The damage advantage
is not grade evidence.

Mechanics reference:
[Critical Weakness](https://deeprockgalactic.wiki.gg/wiki/Warning#Critical_Weakness).

`Rich Atmosphere` mildly mitigates a clean Point Extraction Stage by reducing
its hauling time: the Anomaly increases dwarf movement speed by 50%, does not
speed up enemies, and allows sprinting while carrying heavy minerals. Point
Extraction with an otherwise low-pressure secondary is `Manageable`/`Easy` on
a `Fresh` or `Banked` entry. A `Contested` entry remains
`Demanding`/`Manageable`, because faster hauling does not restore the missing
recovery reserve. This is a one-band adjustment to a borderline time budget,
not a general cancellation of unrelated Pressure.

Mechanics reference:
[Rich Atmosphere](https://deeprockgalactic.wiki.gg/wiki/Warning#Rich_Atmosphere)
and the
[gameplay guide](https://deeprockgalactic.wiki.gg/wiki/How_to_Play_Guide_for_Deep_Rock_Galactic).

`Low Gravity` never changes Difficulty. It can materially simplify vertical
movement, heavy-object handling, and fall recovery in a difficult cave,
including some Point Extraction layouts, but the Briefing does not contain cave
geometry. The layout-dependent benefit remains residual uncertainty.

Mechanics reference:
[Low Gravity](https://deeprockgalactic.wiki.gg/wiki/Warning#Low_Gravity).

`Volatile Guts` never changes Difficulty. Death explosions can punish
close-range combat or a tight defence, but can also clear clustered enemies and
prevent an Exploder's stronger suicide attack. The net effect depends on
distance, loadout, and cave geometry, so it neither promotes nor mitigates a
grade.

Mechanics reference:
[Volatile Guts](https://deeprockgalactic.wiki.gg/wiki/Warning#Volatile_Guts).

`Blood Sugar` is evaluated through Sugar access, not global kill density.
Defence phases concentrate kills and healing drops around the Crew, which can
make the Anomaly strongly favorable. Travel, search, and hauling can separate
miners from individual drops, but this spatial context does not establish
independent Pressure under the accepted recurring-supply calibration.
Industrial Sabotage cannot generate with Blood Sugar; a wire-valid combination
still follows the ordinary known rules.

Blood Sugar changes Difficulty only through dense local defence healing. It
lowers clean Salvage Operation to `Easy` for both profiles and removes Black
Box's own `Manageable` floor. Other Objective, Warning, compound, and
Resource-runway Pressure remain intact: Salvage with a secondary Hiveguard is
still `Demanding`/`Manageable`, and Swarmageddon retains its ordinary
`Manageable` floor even on Blood Sugar Salvage.

Blood Sugar does not establish a Difficulty floor for travel, search, hauling,
Point Extraction, Egg Hunt, or Elimination. Curated calibration treats recurring
nearby enemy supply as sufficient to avoid a systematic Sugar-drought penalty,
including split Crews. Spawn ownership, cadence, proximity, and behavior during
active Dreadnought fights remain uncertain maintainer evidence. Player-facing
copy must not claim Blood Sugar spawns enemies or guarantees healing for every
miner.

Blood Sugar does not lower Escort Duty or Deep Scan: healing miners does not
heal Doretta, recover destroyed segments, or repair Drillevator claws. It does
not add a Haunted Cave compound promotion. Apply the strongest surviving named
rules. Blood Sugar plus Swarmageddon has no special mitigation or compound
grade: Fresh Point Extraction with secondary Elimination remains
`Brutal`/`Demanding`, and a Contested entry remains `Brutal` for both profiles.

Local healing changes the assessment only for Salvage and Black Box. Outside
those holdouts, Blood Sugar is not a cause of Difficulty.

Mechanics reference:
[Blood Sugar](https://deeprockgalactic.wiki.gg/wiki/Warning#Blood_Sugar).
Auxiliary spawn ownership is not a source-confirmed mechanic.

### Intel output and Difficulty indicators

The model supplies only overall Crew grades and three Stage grade pairs.
`DifficultyIndicator` owns its presentation props and compact Crew groups.
Its `difficulty-copy` module localizes level names and complete accessible
assessments, including Stage context. Share text uses the same presentation
formatter for the overall assessment. Presentation code does not reinterpret
grading rules or generate commentary.

On desktop, place overall Difficulty to the right of the `Deep Dive` or
`Elite Deep Dive` kind label. On mobile, use a separate assessment row above
the Dive name. Keep the generated Dive name independent of Difficulty.
Stage assessments align to the right of their Stage heading.

One through four angular chevrons represent Easy, Manageable, Demanding, and
Brutal, with full localized level names. No badge chrome or legend is needed.
Matching grades show one icon and name. Different grades show compact `1–2:`
and `3–4:` conditions inside one assessment block. Wrap within that block when
needed, keeping wrapped groups aligned to the right. Never truncate names.
Color supplements text. The indicator is informational, with no tooltip,
expanded state, or separate focus stop. Provide full localized Dive or Stage
and Crew assessment text to assistive technology without duplicate
announcements. Icons are decorative. The surrounding Dive supplies the
relative calibration context.

The existing Briefing.confidence notice concerns mission-data verification and
is preserved independently of Intel's internal rule confidence.

### Total assessment boundary

Intel assesses every current schema-valid Deep Dive, including combinations
not known to be generator-realizable. Apply known constituent mechanics and
matching named interactions without missing results, special fallback grades,
or extra unusual-input warnings. Unknown quantities remain Workload without
clamping; repeated or permuted Dreadnought variants preserve grades.
Future catalogue additions require an explicit Intel policy
before shipping. Generator realizability classifies test fixtures, not runtime
assessment or Briefing.confidence.

## States

The app must handle:

- loading
- live data
- cached data
- offline with cached data
- offline with no cached data
- fetch failure
- not found
- app update available

If a readable board is already visible, background refresh must keep it visible.
Only the freshness copy and refresh control should change while the refresh is in
flight.

## Tone

The visual direction is an industrial mission board for Hoxxes IV: compact,
warm, rough, and operational. It should feel themed without becoming noisy or
hard to read.

Avoid:

- generic SaaS dashboard patterns
- table-first layouts
- oversized hero composition
- decorative effects that compete with mission data
- implementation terms in primary UI copy

## Copy And Accessibility

Copy should be short, direct, and lightly themed. Use Deep Dive names, mutators,
timing, and recovery language. Avoid explaining how the interface works.

Interactive controls must have usable touch targets. Status changes should be
announced politely when they affect the visible board. State screens should give
keyboard users a sensible focus target.
