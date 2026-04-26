import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { WeeklySnapshotResult } from '~/shared/api/weekly'

type WeeklyDive = WeeklySnapshotResult['dives']['normal']
type WeeklyMission = WeeklyDive['missions'][number]
type PrimaryObjective = WeeklyMission['primaryObjective']
type SecondaryObjective = WeeklyMission['secondaryObjective']

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
