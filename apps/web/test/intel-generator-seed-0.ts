import type { Briefing } from '~/shared/api'

// Facade oracle: deep_dives_from_seed through committed WASM generate(0).
// Generator revision: 988657a17625598df78a7d8cdcf4be2950268750 (Cargo.lock).
// Regenerate via node --experimental-wasm-modules and the committed pkg's generate.
// Unlike the hand-built policy scenarios, this complete pair is generator-realized.
export const generatedSeedZero: Pick<Briefing, 'seed' | 'dives'> = {
  seed: 0,
  dives: {
    normal: {
      name: 'Unknown Shaft',
      biome: 'MagmaCore',
      missions: [
        {
          primaryObjective: {
            kind: 'DeepScan',
            resonanceCrystals: 3,
          },
          secondaryObjective: {
            kind: 'Blackbox',
            blackBoxes: 1,
          },
          anomaly: null,
          warning: 'ScrabNestingGrounds',
        },
        {
          primaryObjective: {
            kind: 'OnSiteRefining',
            morkiteWells: 3,
          },
          secondaryObjective: {
            kind: 'EggHunt',
            eggs: 2,
          },
          anomaly: 'LowGravity',
          warning: 'Parasites',
        },
        {
          primaryObjective: {
            kind: 'EggHunt',
            eggs: 6,
          },
          secondaryObjective: {
            kind: 'SalvageOperation',
            miniMules: 2,
          },
          anomaly: null,
          warning: null,
        },
      ],
    },
    elite: {
      name: 'Abandoned Hate',
      biome: 'SaltPits',
      missions: [
        {
          primaryObjective: {
            kind: 'Elimination',
            dreadnoughts: ['Classic', 'Twins'],
          },
          secondaryObjective: {
            kind: 'DeepScan',
            resonanceCrystals: 2,
          },
          anomaly: null,
          warning: 'RivalPresence',
        },
        {
          primaryObjective: {
            kind: 'HeavyExtraction',
            resiniteMasses: 3,
          },
          secondaryObjective: {
            kind: 'EggHunt',
            eggs: 2,
          },
          anomaly: null,
          warning: 'LethalEnemies',
        },
        {
          primaryObjective: {
            kind: 'Elimination',
            dreadnoughts: ['Hiveguard', 'Twins'],
          },
          secondaryObjective: {
            kind: 'EggHunt',
            eggs: 2,
          },
          anomaly: null,
          warning: 'PitJawColony',
        },
      ],
    },
  },
}
