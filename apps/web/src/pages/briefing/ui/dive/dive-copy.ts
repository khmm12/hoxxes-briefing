import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type {
  DeepDiveAnomaly,
  DeepDiveBiome,
  DeepDiveDreadnought,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
} from '~/shared/api'

export function formatDiveKind(i18n: I18n, kind: 'normal' | 'elite'): string {
  return kind === 'elite' ? i18n._(msg`Elite Deep Dive`) : i18n._(msg`Deep Dive`)
}

// Two levels of objective copy, kept in sync with the docs/domain.md tables: the
// primary description is the full mission walkthrough, the secondary description
// is only that stage's smaller side goal (in a Deep Dive a secondary is a
// condensed task, not the whole mission). Both are grounded in the DRG wiki
// mission pages and condensed to a line — not verbatim in-game strings like the
// warning/anomaly flavor.
//
// Elimination is absent from both objective switches: its detail is per-variant,
// surfaced through `formatDreadnoughtDescription` on each dreadnought token, so
// its kind is excluded from the types and the compiler blocks a stray line
// description.

export function formatBiome(i18n: I18n, biome: DeepDiveBiome): string {
  switch (biome) {
    case 'CrystallineCaverns':
      return i18n._(msg`Crystalline Caverns`)
    case 'FungusBogs':
      return i18n._(msg`Fungus Bogs`)
    case 'MagmaCore':
      return i18n._(msg`Magma Core`)
    case 'RadioactiveExclusionZone':
      return i18n._(msg`Radioactive Exclusion Zone`)
    case 'DenseBiozone':
      return i18n._(msg`Dense Biozone`)
    case 'SandblastedCorridors':
      return i18n._(msg`Sandblasted Corridors`)
    case 'SaltPits':
      return i18n._(msg`Salt Pits`)
    case 'GlacialStrata':
      return i18n._(msg`Glacial Strata`)
    case 'AzureWeald':
      return i18n._(msg`Azure Weald`)
    case 'HollowBough':
      return i18n._(msg`Hollow Bough`)
    case 'OssuaryDepths':
      return i18n._(msg`Ossuary Depths`)
  }
}

export function formatBiomeDescription(i18n: I18n, biome: DeepDiveBiome): string {
  switch (biome) {
    case 'CrystallineCaverns':
      return i18n._(
        msg`Open chambers lit by massive crystals — easy to read, but deceptively dangerous. Electrocrystals arc electricity on contact and spider webs snare your movement.`,
      )
    case 'FungusBogs':
      return i18n._(
        msg`Swampy caverns of towering xenofungi platforms. Poison spores and sticky goo that drags at your movement make routing, not raw combat, the real threat.`,
      )
    case 'MagmaCore':
      return i18n._(
        msg`Spacious volcanic caverns of multi-level plateaus and lava. Hot rock burns underfoot, geysers erupt, and quakes slow you to a crawl.`,
      )
    case 'RadioactiveExclusionZone':
      return i18n._(
        msg`Desolate open spaces linked by wide tunnels under a sparse, irradiated glow. Volatile Uranium crystals bleed radiation and spider webs snare movement.`,
      )
    case 'DenseBiozone':
      return i18n._(
        msg`Subterranean rainforest of twisting coral and bioluminescent growth. Ejector cacti, cave urchins, and explosive plants lace the tangled, hazard-rich routes.`,
      )
    case 'SandblastedCorridors':
      return i18n._(
        msg`Soft sandstone desert strewn with giant fossils and little cover. Wind tunnels fling you off course and sandstorms gut visibility while slowing you down.`,
      )
    case 'SaltPits':
      return i18n._(
        msg`Big open chambers of red and white salt crystal, barren of vegetation. Unstable ceiling crystals deal massive damage when dislodged and platforms collapse under lingering feet.`,
      )
    case 'GlacialStrata':
      return i18n._(
        msg`Frozen ice caverns where your heat drains toward a hard freeze. Crevasses open underfoot, ice is slick, icicles fall, and blizzards cut visibility.`,
      )
    case 'AzureWeald':
      return i18n._(
        msg`Bioluminescent alien jungle of splendor and horror, glowing blue. Strange stone pillars halve damage for dwarves and enemies alike, turning fights into a puzzle.`,
      )
    case 'HollowBough':
      return i18n._(
        msg`Petrified halls of dried grass and towering wood, webbed with red thorns. Parasitic vines wound on contact and choke the routes into tight, dangerous passages.`,
      )
    case 'OssuaryDepths':
      return i18n._(
        msg`Bone-strewn Ossiran depths of sandy ground and wall-hugging rock platforms. Ossiran Scrabs and buried Pit Jaws ambush from the debris, and spider webs snare movement.`,
      )
  }
}

export function formatPrimaryObjective(i18n: I18n, objective: DeepDivePrimaryObjective): string {
  switch (objective.kind) {
    case 'DeepScan':
      return i18n._(msg`Deep Scan x${objective.resonanceCrystals}`)
    case 'EscortDuty':
      return i18n._(msg`Escort Duty`)
    case 'MiningExpedition':
      return i18n._(msg`Morkite x${objective.morkite}`)
    case 'IndustrialSabotage':
      return i18n._(msg`Industrial Sabotage`)
    case 'EggHunt':
      return i18n._(msg`Egg x${objective.eggs}`)
    case 'PointExtraction':
      return i18n._(msg`Aquarq x${objective.aquarqs}`)
    case 'OnSiteRefining':
      return i18n._(msg`Morkite Well x${objective.morkiteWells}`)
    case 'SalvageOperation':
      return i18n._(msg`Mule x${objective.miniMules}`)
    case 'Elimination':
      return i18n._(
        msg`Dreadnought x${objective.dreadnoughts.length} (${formatDreadnoughtList(i18n, objective.dreadnoughts)})`,
      )
    case 'HeavyExtraction':
      return i18n._(msg`Resinite Mass x${objective.resiniteMasses}`)
  }
}

export function formatSecondaryObjective(i18n: I18n, objective: DeepDiveSecondaryObjective): string {
  switch (objective.kind) {
    case 'EggHunt':
      return i18n._(msg`Egg x${objective.eggs}`)
    case 'DeepScan':
      return i18n._(msg`Deep Scan x${objective.resonanceCrystals}`)
    case 'Blackbox':
      return i18n._(msg`Black Box`)
    case 'Elimination':
      return i18n._(
        msg`Dreadnought x${objective.dreadnoughts.length} (${formatDreadnoughtList(i18n, objective.dreadnoughts)})`,
      )
    case 'MiningExpedition':
      return i18n._(msg`Morkite x${objective.morkite}`)
    case 'OnSiteRefining':
      return i18n._(msg`Morkite Well x${objective.morkiteWells}`)
    case 'SalvageOperation':
      return i18n._(msg`Mule x${objective.miniMules}`)
    case 'HeavyExtraction':
      return i18n._(msg`Resinite Mass x${objective.resiniteMasses}`)
  }
}

export function formatAnomaly(i18n: I18n, anomaly: DeepDiveAnomaly | null): string {
  if (anomaly == null) {
    return i18n._(msg`None`)
  }

  switch (anomaly) {
    case 'VolatileGuts':
      return i18n._(msg`Volatile Guts`)
    case 'RichAtmosphere':
      return i18n._(msg`Rich Atmosphere`)
    case 'CriticalWeakness':
      return i18n._(msg`Critical Weakness`)
    case 'BloodSugar':
      return i18n._(msg`Blood Sugar`)
    case 'LowGravity':
      return i18n._(msg`Low Gravity`)
  }
}

export function formatWarning(i18n: I18n, warning: DeepDiveWarning | null): string {
  if (warning == null) {
    return i18n._(msg`None`)
  }

  switch (warning) {
    case 'RegenerativeBugs':
      return i18n._(msg`Regenerative Bugs`)
    case 'EliteThreat':
      return i18n._(msg`Elite Threat`)
    case 'MacteraPlague':
      return i18n._(msg`Mactera Plague`)
    case 'EboniteOutbreak':
      return i18n._(msg`Ebonite Outbreak`)
    case 'DuckAndCover':
      return i18n._(msg`Duck and Cover`)
    case 'CaveLeechCluster':
      return i18n._(msg`Cave Leech Cluster`)
    case 'LowOxygen':
      return i18n._(msg`Low Oxygen`)
    case 'ExploderInfestation':
      return i18n._(msg`Exploder Infestation`)
    case 'HauntedCave':
      return i18n._(msg`Haunted Cave`)
    case 'LethalEnemies':
      return i18n._(msg`Lethal Enemies`)
    case 'ShieldDisruption':
      return i18n._(msg`Shield Disruption`)
    case 'Parasites':
      return i18n._(msg`Parasites`)
    case 'Swarmageddon':
      return i18n._(msg`Swarmageddon`)
    case 'RivalPresence':
      return i18n._(msg`Rival Presence`)
    case 'PitJawColony':
      return i18n._(msg`Pit-Jaw Colony`)
    case 'ScrabNestingGrounds':
      return i18n._(msg`Scrab Nesting Grounds`)
  }
}

// Official in-game flavor texts for warnings and anomalies.
export function formatAnomalyDescription(i18n: I18n, anomaly: DeepDiveAnomaly): string {
  switch (anomaly) {
    case 'VolatileGuts':
      return i18n._(
        msg`The odd composition of local food sources means all enemies violently combust upon death, causing area damage.`,
      )
    case 'RichAtmosphere':
      return i18n._(
        msg`A special mix of gasses in the air makes both Dwarves and aliens faster. As a side effect, everyone's voice is funnier than usual.`,
      )
    case 'CriticalWeakness':
      return i18n._(msg`Hitting Weak Points hurts even more than usual.`)
    case 'BloodSugar':
      return i18n._(
        msg`Toxins in the atmosphere drains your health, but crystalize the blood of Hoxxes Wildlife into Red Sugar. Kill to survive!`,
      )
    case 'LowGravity':
      return i18n._(msg`Mysterious gravitational irregularities result in lowered overall gravity in the mission area.`)
  }
}

export function formatWarningDescription(i18n: I18n, warning: DeepDiveWarning): string {
  switch (warning) {
    case 'RegenerativeBugs':
      return i18n._(msg`After a few seconds of not taking damage, the creatures will start recovering health.`)
    case 'EliteThreat':
      return i18n._(
        msg`Stronger, faster, and deadlier enemy variants might appear in the caves. Make every bullet count!`,
      )
    case 'MacteraPlague':
      return i18n._(msg`Most threats in this mission will come from the air, the caves are full of Mactera.`)
    case 'EboniteOutbreak':
      return i18n._(msg`This mission site suffers from a massive Ebonite infestation. Rock and Stone - literally!`)
    case 'DuckAndCover':
      return i18n._(
        msg`For reasons unknown, there are far more ranged enemies of all classes at this mission site. Seek cover!`,
      )
    case 'CaveLeechCluster':
      return i18n._(msg`Watch out for the ceiling, there is an unusual density of Cave Leeches.`)
    case 'LowOxygen':
      return i18n._(
        msg`The mission area has particularly low concentrations of breathable air. Dwarves must frequently replenish their O2 by standing near one of the tanks attached to the M.U.L.E. and other devices.`,
      )
    case 'ExploderInfestation':
      return i18n._(msg`You will be attacked by an almost constant flow of Glyphid Exploder packs.`)
    case 'HauntedCave':
      return i18n._(
        msg`A slow, but invulnerable and deadly creature has been detected in this area. It will relentlessly chase you, throughout the mission. Do not let it get close.`,
      )
    case 'LethalEnemies':
      return i18n._(msg`Melee damage from all enemies hurts a lot more than usual.`)
    case 'ShieldDisruption':
      return i18n._(msg`Magnetic interference is causing all shields to malfunction.`)
    case 'Parasites':
      return i18n._(
        msg`Something is eating the creatures from the inside out, and will go after you as soon as their hosts die.`,
      )
    case 'Swarmageddon':
      return i18n._(msg`Prepare yourself for a tsunami of Glyphid Swarmers!`)
    case 'RivalPresence':
      return i18n._(msg`Sensors have detected Rival presence in the area!`)
    case 'PitJawColony':
      return i18n._(msg`Scanners have detected several clusters of Ossiran Pit Jaws in the area.`)
    case 'ScrabNestingGrounds':
      return i18n._(msg`Swarms of Ossiran Scrabs have begun nesting throughout the cave.`)
  }
}

// The full mission each primary objective drops the team into. Elimination has
// no line-level description — its detail is per-dreadnought, tokenized at the
// call site — so it opts out here, and the tooltip is simply absent.
export function formatPrimaryObjectiveDescription(
  i18n: I18n,
  kind: DeepDivePrimaryObjective['kind'],
): string | undefined {
  switch (kind) {
    case 'Elimination':
      return undefined
    case 'DeepScan':
      return i18n._(
        msg`Track down Resonance Crystals with your rangefinder, deploy Scanners to pinpoint the Morkite Geode, then ride the Drillevator down to gather its Morkite Seeds.`,
      )
    case 'EscortDuty':
      return i18n._(
        msg`Escort and repair the Drilldozer to the Ommoran Heartstone, refuel it along the way, then defend the Heartstone dig and extract.`,
      )
    case 'MiningExpedition':
      return i18n._(msg`Mine the Morkite quota from the caves and deposit it into the M.U.L.E.`)
    case 'IndustrialSabotage':
      return i18n._(
        msg`Hack two guarded power stations to drop the shield, destroy the Caretaker, then extract the stolen data.`,
      )
    case 'EggHunt':
      return i18n._(
        msg`Pull alien eggs from the cave walls and deposit them — each egg you take can trigger an enemy wave.`,
      )
    case 'PointExtraction':
      return i18n._(
        msg`Dig Aquarqs out of the walls and haul them to the Minehead while defending against escalating waves.`,
      )
    case 'OnSiteRefining':
      return i18n._(
        msg`Find the Liquid Morkite wells, run pipelines to the mobile refinery, and keep it patched while it pumps.`,
      )
    case 'SalvageOperation':
      return i18n._(
        msg`Repair the abandoned Mini M.U.L.E.s, power up the Drop Pod, and hold the uplink until extraction.`,
      )
    case 'HeavyExtraction':
      return i18n._(msg`Dig the massive Resinite Masses free, attach Lift Rockets, and send them up to orbit.`)
  }
}

// The condensed side goal a secondary objective adds on top of the mission — the
// task itself, not the whole mission it is borrowed from. Elimination opts out
// for the same reason as the primary variant.
export function formatSecondaryObjectiveDescription(
  i18n: I18n,
  kind: DeepDiveSecondaryObjective['kind'],
): string | undefined {
  switch (kind) {
    case 'Elimination':
      return undefined
    case 'EggHunt':
      return i18n._(msg`Pull the required alien eggs from the cave walls and deposit them.`)
    case 'DeepScan':
      return i18n._(msg`Scan the required Resonance Crystals hidden through the cave.`)
    case 'Blackbox':
      return i18n._(
        msg`Find the crashed Black Box on your scanner, repair it, and hold its radius until the download finishes.`,
      )
    case 'MiningExpedition':
      return i18n._(msg`Mine the required Morkite and deposit it into the M.U.L.E.`)
    case 'OnSiteRefining':
      return i18n._(msg`Hook a Liquid Morkite well up to the extraction pod and pump it dry.`)
    case 'SalvageOperation':
      return i18n._(msg`Repair the required Mini M.U.L.E.s scattered around the stage.`)
    case 'HeavyExtraction':
      return i18n._(msg`Free the required Resinite Mass and lift it out with rockets.`)
  }
}

export function formatDreadnoughtDescription(i18n: I18n, dreadnought: DeepDiveDreadnought): string {
  switch (dreadnought) {
    case 'Classic':
      return i18n._(msg`Standard Glyphid Dreadnought with armor-shell timing and direct boss pressure.`)
    case 'Hiveguard':
      return i18n._(msg`Dreadnought variant with Sentinel adds and phased vulnerability.`)
    case 'Twins':
      return i18n._(msg`Paired Lacerator and Arbalest fight with split melee and ranged pressure.`)
  }
}

function formatDreadnoughtList(i18n: I18n, dreadnoughts: ReadonlyArray<DeepDiveDreadnought>): string {
  return dreadnoughts.map((dreadnought) => formatDreadnought(i18n, dreadnought)).join(' + ')
}

export function formatDreadnought(i18n: I18n, dreadnought: DeepDiveDreadnought): string {
  switch (dreadnought) {
    case 'Classic':
      return i18n._(msg`Classic`)
    case 'Hiveguard':
      return i18n._(msg`Hiveguard`)
    case 'Twins':
      return i18n._(msg`Twins`)
  }
}
