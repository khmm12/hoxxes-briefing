import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { WeeklySnapshotResult } from '~/shared/api'

type WeeklyDive = WeeklySnapshotResult['dives']['normal']
type WeeklyMission = WeeklyDive['missions'][number]
type PrimaryObjective = WeeklyMission['primaryObjective']
type SecondaryObjective = WeeklyMission['secondaryObjective']
type WeeklyWarning = NonNullable<WeeklyMission['warning']>
type WeeklyMutator = NonNullable<WeeklyMission['mutator']>

export function formatDiveKind(i18n: I18n, kind: 'normal' | 'elite'): string {
  return kind === 'elite' ? i18n._(msg`Elite Deep Dive`) : i18n._(msg`Deep Dive`)
}

export function formatBiome(i18n: I18n, biome: WeeklyDive['biome']): string {
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

export function formatPrimaryObjective(i18n: I18n, objective: PrimaryObjective): string {
  switch (objective.kind) {
    case 'DeepScan':
      return i18n._(msg`Crystal Scan x${objective.resonanceCrystals}`)
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

export function formatSecondaryObjective(i18n: I18n, objective: SecondaryObjective): string {
  switch (objective.kind) {
    case 'EggHunt':
      return i18n._(msg`Egg x${objective.eggs}`)
    case 'DeepScan':
      return i18n._(msg`Crystal Scan x${objective.resonanceCrystals}`)
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
    case 'HeavyExcavation':
      return i18n._(msg`Resinite Mass x${objective.resiniteMasses}`)
  }
}

export function formatMutator(i18n: I18n, mutator: WeeklyMission['mutator']): string {
  if (mutator == null) {
    return i18n._(msg`None`)
  }

  switch (mutator) {
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

export function formatWarning(i18n: I18n, warning: WeeklyMission['warning']): string {
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

// Official in-game flavor texts for warnings and mutators.
export function formatMutatorDescription(i18n: I18n, mutator: WeeklyMutator): string {
  switch (mutator) {
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

export function formatWarningDescription(i18n: I18n, warning: WeeklyWarning): string {
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

function formatDreadnoughtList(i18n: I18n, dreadnoughts: ReadonlyArray<'Dreadnought' | 'Hiveguard' | 'Twins'>): string {
  return dreadnoughts.map((dreadnought) => formatDreadnought(i18n, dreadnought)).join(' + ')
}

function formatDreadnought(i18n: I18n, dreadnought: 'Dreadnought' | 'Hiveguard' | 'Twins'): string {
  switch (dreadnought) {
    case 'Dreadnought':
      return i18n._(msg`Classic`)
    case 'Hiveguard':
      return i18n._(msg`Hiveguard`)
    case 'Twins':
      return i18n._(msg`Twins`)
  }
}
