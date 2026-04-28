import * as wasm from '@hoxxes-briefing/wasm'
import type {
  CurrentDeepDives,
  DeepDive,
  DeepDiveBiome,
  DeepDiveMission,
  DeepDiveMutator,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
} from '../../application/models/current-deep-dives.ts'

export type GeneratedDeepDives = Pick<CurrentDeepDives, 'seed' | 'dives'>

const mapBiome = (biome: wasm.Biome): DeepDiveBiome => {
  switch (biome) {
    case wasm.Biome.CrystallineCaverns:
      return 'CrystallineCaverns'
    case wasm.Biome.FungusBogs:
      return 'FungusBogs'
    case wasm.Biome.MagmaCore:
      return 'MagmaCore'
    case wasm.Biome.RadioactiveExclusionZone:
      return 'RadioactiveExclusionZone'
    case wasm.Biome.DenseBiozone:
      return 'DenseBiozone'
    case wasm.Biome.SandblastedCorridors:
      return 'SandblastedCorridors'
    case wasm.Biome.SaltPits:
      return 'SaltPits'
    case wasm.Biome.GlacialStrata:
      return 'GlacialStrata'
    case wasm.Biome.AzureWeald:
      return 'AzureWeald'
    case wasm.Biome.HollowBough:
      return 'HollowBough'
    case wasm.Biome.OssuaryDepths:
      return 'OssuaryDepths'
  }

  throw new Error(`Unsupported biome value from generator: ${biome}`)
}

const mapMutator = (mutator: wasm.DeepDiveMutator): DeepDiveMutator => {
  switch (mutator) {
    case wasm.DeepDiveMutator.BloodSugar:
      return 'BloodSugar'
    case wasm.DeepDiveMutator.CriticalWeakness:
      return 'CriticalWeakness'
    case wasm.DeepDiveMutator.LowGravity:
      return 'LowGravity'
    case wasm.DeepDiveMutator.RichAtmosphere:
      return 'RichAtmosphere'
    case wasm.DeepDiveMutator.VolatileGuts:
      return 'VolatileGuts'
  }

  throw new Error(`Unsupported mutator value from generator: ${mutator}`)
}

const mapWarning = (warning: wasm.DeepDiveWarning): DeepDiveWarning => {
  switch (warning) {
    case wasm.DeepDiveWarning.CaveLeechCluster:
      return 'CaveLeechCluster'
    case wasm.DeepDiveWarning.DuckAndCover:
      return 'DuckAndCover'
    case wasm.DeepDiveWarning.EboniteOutbreak:
      return 'EboniteOutbreak'
    case wasm.DeepDiveWarning.EliteThreat:
      return 'EliteThreat'
    case wasm.DeepDiveWarning.ExploderInfestation:
      return 'ExploderInfestation'
    case wasm.DeepDiveWarning.HauntedCave:
      return 'HauntedCave'
    case wasm.DeepDiveWarning.LethalEnemies:
      return 'LethalEnemies'
    case wasm.DeepDiveWarning.LowOxygen:
      return 'LowOxygen'
    case wasm.DeepDiveWarning.MacteraPlague:
      return 'MacteraPlague'
    case wasm.DeepDiveWarning.Parasites:
      return 'Parasites'
    case wasm.DeepDiveWarning.PitJawColony:
      return 'PitJawColony'
    case wasm.DeepDiveWarning.RegenerativeBugs:
      return 'RegenerativeBugs'
    case wasm.DeepDiveWarning.RivalPresence:
      return 'RivalPresence'
    case wasm.DeepDiveWarning.ScrabNestingGrounds:
      return 'ScrabNestingGrounds'
    case wasm.DeepDiveWarning.ShieldDisruption:
      return 'ShieldDisruption'
    case wasm.DeepDiveWarning.Swarmageddon:
      return 'Swarmageddon'
  }

  throw new Error(`Unsupported warning value from generator: ${warning}`)
}

const mapPrimaryObjective = (objective: wasm.DeepDivePrimaryObjective): DeepDivePrimaryObjective => {
  switch (objective.kind) {
    case 'DeepScan':
      return { kind: 'DeepScan', resonanceCrystals: objective.resonanceCrystals }
    case 'EscortDuty':
      return { kind: 'EscortDuty', refuels: objective.refuels }
    case 'MiningExpedition':
      return { kind: 'MiningExpedition', morkite: objective.morkite }
    case 'IndustrialSabotage':
      return { kind: 'IndustrialSabotage', powerStations: objective.powerStations }
    case 'EggHunt':
      return { kind: 'EggHunt', eggs: objective.eggs }
    case 'PointExtraction':
      return { kind: 'PointExtraction', aquarqs: objective.aquarqs }
    case 'OnSiteRefining':
      return { kind: 'OnSiteRefining', morkiteWells: objective.morkiteWells }
    case 'SalvageOperation':
      return { kind: 'SalvageOperation', miniMules: objective.miniMules }
    case 'Elimination':
      return { kind: 'Elimination', dreadnoughts: [...objective.dreadnoughtKinds] }
    case 'HeavyExtraction':
      return { kind: 'HeavyExtraction', resiniteMasses: objective.resiniteMasses }
  }
  throw new Error('Unsupported primary objective from generator')
}

const mapSecondaryObjective = (objective: wasm.DeepDiveSecondaryObjective): DeepDiveSecondaryObjective => {
  switch (objective.kind) {
    case 'EggHunt':
      return { kind: 'EggHunt', eggs: objective.eggs }
    case 'DeepScan':
      return { kind: 'DeepScan', resonanceCrystals: objective.resonanceCrystals }
    case 'Blackbox':
      return { kind: 'Blackbox', blackBoxes: objective.blackBoxes }
    case 'Elimination':
      return { kind: 'Elimination', dreadnoughts: [...objective.dreadnoughtKinds] }
    case 'MiningExpedition':
      return { kind: 'MiningExpedition', morkite: objective.morkite }
    case 'OnSiteRefining':
      return { kind: 'OnSiteRefining', morkiteWells: objective.morkiteWells }
    case 'SalvageOperation':
      return { kind: 'SalvageOperation', miniMules: objective.miniMules }
    case 'HeavyExcavation':
      return { kind: 'HeavyExcavation', resiniteMasses: objective.resiniteMasses }
  }
  throw new Error('Unsupported secondary objective from generator')
}

const mapMission = (mission: wasm.DeepDiveMission): DeepDiveMission => {
  return {
    primaryObjective: mapPrimaryObjective(mission.primaryObjective),
    secondaryObjective: mapSecondaryObjective(mission.secondaryObjective),
    mutator: mission.mutator == null ? null : mapMutator(mission.mutator),
    warning: mission.warning == null ? null : mapWarning(mission.warning),
  }
}

const mapDive = (deepDive: wasm.DeepDive): DeepDive => {
  return {
    name: deepDive.name,
    biome: mapBiome(deepDive.biome),
    missions: deepDive.missions.map(mapMission),
  }
}

export const generateWeeklyDives = (seed: number): GeneratedDeepDives => {
  const result = wasm.generate(new wasm.Seed(seed))

  return {
    seed: result.seed.value,
    dives: {
      normal: mapDive(result.normal),
      elite: mapDive(result.elite),
    },
  }
}
