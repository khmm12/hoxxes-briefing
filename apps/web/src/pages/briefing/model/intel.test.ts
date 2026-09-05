import { describe, expect, it } from 'vitest'
import type {
  DeepDive,
  DeepDiveAnomaly,
  DeepDiveMission,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
  DeepDiveWarning,
} from '~/shared/api'
import { generatedSeedZero } from '~test/intel-generator-seed-0'
import { buildIntel, type Difficulty } from './intel'

describe('buildIntel', () => {
  it('keeps overall medians independent of stage traversal', () => {
    const shield = mission({ warning: 'ShieldDisruption' })
    const ranged = mission({ warning: 'DuckAndCover' })
    const first = buildIntel(dive([shield, ranged, mission()]), 'normal')
    const reordered = buildIntel(dive([ranged, shield, mission()]), 'normal')
    expect(first.overall).toEqual({ small: 'Demanding', full: 'Demanding' })
    expect(reordered.overall).toEqual(first.overall)
  })
  it('returns only grades for the Dive and its three Stages', () => {
    const result = buildIntel(dive(), 'normal')
    expect(result.overall).toEqual({ small: 'Easy', full: 'Easy' })
    expect(result).not.toHaveProperty('explanation')
    expect(result.stages[0]).not.toHaveProperty('explanation')
    expect(result.stages[0]).not.toHaveProperty('hotspotLabel')

    expect(result.stages).toHaveLength(3)
    expect(result.stages[0]).toEqual({
      small: 'Easy',
      full: 'Easy',
    })
  })

  it.each<[DeepDivePrimaryObjective, Difficulty, Difficulty]>([
    [{ kind: 'MiningExpedition', morkite: 400 }, 'Easy', 'Easy'],
    [{ kind: 'EggHunt', eggs: 8 }, 'Easy', 'Easy'],
    [{ kind: 'DeepScan', resonanceCrystals: 5 }, 'Easy', 'Easy'],
    [{ kind: 'HeavyExtraction', resiniteMasses: 4 }, 'Easy', 'Easy'],
    [{ kind: 'OnSiteRefining', morkiteWells: 3 }, 'Easy', 'Easy'],
    [{ kind: 'SalvageOperation', miniMules: 3 }, 'Manageable', 'Manageable'],
    [{ kind: 'EscortDuty', refuels: 2 }, 'Demanding', 'Manageable'],
    [{ kind: 'IndustrialSabotage', powerStations: 2 }, 'Brutal', 'Demanding'],
    [{ kind: 'Elimination', dreadnoughts: ['Classic', 'Twins'] }, 'Manageable', 'Manageable'],
    [{ kind: 'Elimination', dreadnoughts: ['Hiveguard', 'Classic'] }, 'Demanding', 'Manageable'],
  ])('calibrates clean %j', (primaryObjective, small, full) => {
    const result = buildIntel(dive([mission({ primaryObjective }), mission(), mission()]), 'normal')
    expect(result.stages[0]).toMatchObject({ small, full })
    expect(result.overall).toEqual({ small: 'Easy', full: 'Easy' })
  })

  it.each<[Partial<DeepDiveMission>, [Difficulty, Difficulty][]]>([
    [
      {},
      [
        ['Demanding', 'Easy'],
        ['Manageable', 'Easy'],
        ['Demanding', 'Manageable'],
      ],
    ],
    [
      { secondaryObjective: { kind: 'Elimination', dreadnoughts: ['Classic'] } },
      [
        ['Brutal', 'Demanding'],
        ['Demanding', 'Manageable'],
        ['Brutal', 'Brutal'],
      ],
    ],
    [
      { secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 } },
      [
        ['Demanding', 'Manageable'],
        ['Demanding', 'Manageable'],
        ['Brutal', 'Demanding'],
      ],
    ],
    [
      { warning: 'LowOxygen' },
      [
        ['Brutal', 'Demanding'],
        ['Demanding', 'Manageable'],
        ['Brutal', 'Brutal'],
      ],
    ],
    [
      { warning: 'DuckAndCover' },
      [
        ['Brutal', 'Demanding'],
        ['Brutal', 'Demanding'],
        ['Brutal', 'Brutal'],
      ],
    ],
    [
      { warning: 'MacteraPlague' },
      [
        ['Demanding', 'Manageable'],
        ['Demanding', 'Manageable'],
        ['Demanding', 'Demanding'],
      ],
    ],
    [
      { anomaly: 'RichAtmosphere' },
      [
        ['Manageable', 'Easy'],
        ['Manageable', 'Easy'],
        ['Demanding', 'Manageable'],
      ],
    ],
    [
      { warning: 'MacteraPlague', anomaly: 'RichAtmosphere' },
      [
        ['Demanding', 'Manageable'],
        ['Demanding', 'Manageable'],
        ['Demanding', 'Demanding'],
      ],
    ],
    [
      {
        secondaryObjective: { kind: 'Elimination', dreadnoughts: ['Classic'] },
        anomaly: 'BloodSugar',
        warning: 'Swarmageddon',
      },
      [
        ['Brutal', 'Demanding'],
        ['Demanding', 'Manageable'],
        ['Brutal', 'Brutal'],
      ],
    ],
  ])('preserves Point Extraction interactions %j at every entry', (modifiers, pairs) => {
    const target = mission({ primaryObjective: { kind: 'PointExtraction', aquarqs: 10 }, ...modifiers })
    const results = [assess(target), assess(target, mission()), assess(target, contested())]
    for (const [index, result] of results.entries()) expect([result.small, result.full]).toEqual(pairs[index])
  })

  it.each([
    ['Fresh', undefined, 'Demanding', 'Easy'],
    ['Banked', mission(), 'Manageable', 'Easy'],
    ['Contested', mission({ primaryObjective: { kind: 'SalvageOperation', miniMules: 2 } }), 'Demanding', 'Manageable'],
  ] as const)('carries %s resources into Point Extraction', (_, previous, small, full) => {
    const extraction = mission({ primaryObjective: { kind: 'PointExtraction', aquarqs: 7 } })
    const result = buildIntel(
      dive(previous ? [previous, extraction, mission()] : [extraction, mission(), mission()]),
      'normal',
    )
    expect(result.stages[previous ? 1 : 0]).toMatchObject({ small, full })
  })

  it('keeps reduced secondary mechanics separate from primary defences', () => {
    const result = buildIntel(
      dive([
        mission({ secondaryObjective: { kind: 'SalvageOperation', miniMules: 2 } }),
        mission({ secondaryObjective: { kind: 'DeepScan', resonanceCrystals: 2 } }),
        mission({ secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 } }),
      ]),
      'normal',
    )
    expect(result.stages.map(({ small, full }) => [small, full])).toEqual([
      ['Easy', 'Easy'],
      ['Easy', 'Easy'],
      ['Manageable', 'Manageable'],
    ])
  })

  it('preserves a secondary Hiveguard floor under local Blood Sugar healing', () => {
    const result = buildIntel(
      dive([
        mission({
          primaryObjective: { kind: 'SalvageOperation', miniMules: 2 },
          secondaryObjective: { kind: 'Elimination', dreadnoughts: ['Hiveguard'] },
          anomaly: 'BloodSugar',
        }),
        mission(),
        mission(),
      ]),
      'normal',
    )
    expect(result.stages[0]).toMatchObject({ small: 'Demanding', full: 'Manageable' })
  })

  it.each<[DeepDiveWarning, string, string]>([
    ['HauntedCave', 'Brutal', 'Demanding'],
    ['DuckAndCover', 'Demanding', 'Demanding'],
    ['ShieldDisruption', 'Demanding', 'Demanding'],
    ['CaveLeechCluster', 'Demanding', 'Manageable'],
    ['LowOxygen', 'Manageable', 'Manageable'],
    ['EliteThreat', 'Manageable', 'Manageable'],
    ['LethalEnemies', 'Manageable', 'Manageable'],
    ['RivalPresence', 'Manageable', 'Manageable'],
    ['MacteraPlague', 'Manageable', 'Manageable'],
    ['ExploderInfestation', 'Manageable', 'Manageable'],
    ['Swarmageddon', 'Manageable', 'Manageable'],
    ['ScrabNestingGrounds', 'Manageable', 'Manageable'],
    ['PitJawColony', 'Manageable', 'Manageable'],
    ['EboniteOutbreak', 'Easy', 'Easy'],
    ['Parasites', 'Easy', 'Easy'],
    ['RegenerativeBugs', 'Easy', 'Easy'],
  ])('calibrates neutral %s', (warning, small, full) => {
    expect(buildIntel(dive([mission({ warning }), mission(), mission()]), 'normal').stages[0]).toMatchObject({
      small,
      full,
    })
  })

  it.each<[DeepDivePrimaryObjective, DeepDiveWarning, string, string]>([
    [{ kind: 'DeepScan', resonanceCrystals: 3 }, 'DuckAndCover', 'Brutal', 'Demanding'],
    [{ kind: 'DeepScan', resonanceCrystals: 3 }, 'MacteraPlague', 'Brutal', 'Demanding'],
    [{ kind: 'SalvageOperation', miniMules: 2 }, 'MacteraPlague', 'Demanding', 'Manageable'],
    [{ kind: 'EscortDuty', refuels: 1 }, 'DuckAndCover', 'Brutal', 'Demanding'],
    [{ kind: 'PointExtraction', aquarqs: 10 }, 'LowOxygen', 'Brutal', 'Demanding'],
    [{ kind: 'OnSiteRefining', morkiteWells: 3 }, 'LowOxygen', 'Demanding', 'Demanding'],
  ])('applies named %j with %s interaction', (primaryObjective, warning, small, full) => {
    expect(
      buildIntel(dive([mission({ primaryObjective, warning }), mission(), mission()]), 'normal').stages[0],
    ).toMatchObject({ small, full })
  })

  // Complete synthetic Dives below are wire-valid-only fixtures. Individual
  // quotas match the calibration; no generator realizability is inferred.
  it.each<[DeepDiveSecondaryObjective, Difficulty, Difficulty]>([
    [{ kind: 'MiningExpedition', morkite: 150 }, 'Easy', 'Easy'],
    [{ kind: 'EggHunt', eggs: 2 }, 'Easy', 'Easy'],
    [{ kind: 'OnSiteRefining', morkiteWells: 1 }, 'Easy', 'Easy'],
    [{ kind: 'SalvageOperation', miniMules: 2 }, 'Easy', 'Easy'],
    [{ kind: 'DeepScan', resonanceCrystals: 2 }, 'Easy', 'Easy'],
    [{ kind: 'HeavyExtraction', resiniteMasses: 1 }, 'Easy', 'Easy'],
    [{ kind: 'Blackbox', blackBoxes: 1 }, 'Manageable', 'Manageable'],
    [{ kind: 'Elimination', dreadnoughts: ['Classic'] }, 'Manageable', 'Manageable'],
    [{ kind: 'Elimination', dreadnoughts: ['Twins'] }, 'Manageable', 'Manageable'],
    [{ kind: 'Elimination', dreadnoughts: ['Hiveguard'] }, 'Demanding', 'Manageable'],
  ])('preserves the secondary %j floor', (secondaryObjective, small, full) => {
    expect(assess(mission({ secondaryObjective }))).toMatchObject({ small, full })
  })

  it.each<[DeepDivePrimaryObjective, number[]]>([
    [{ kind: 'MiningExpedition', morkite: 200 }, [200, 225, 250, 325, 400, 0, 999]],
    [{ kind: 'EggHunt', eggs: 4 }, [4, 6, 8, 0, 999]],
    [{ kind: 'DeepScan', resonanceCrystals: 3 }, [3, 5, 0, 999]],
    [{ kind: 'HeavyExtraction', resiniteMasses: 3 }, [3, 4, 0, 999]],
    [{ kind: 'EscortDuty', refuels: 1 }, [1, 2, 0, 999]],
    [{ kind: 'SalvageOperation', miniMules: 2 }, [2, 3, 0, 999]],
    [{ kind: 'PointExtraction', aquarqs: 7 }, [7, 10, 0, 999]],
  ])('keeps quantity as Workload for %j', (primaryObjective, quantities) => {
    const field = Object.keys(primaryObjective).find((key) => key !== 'kind') as string
    const expected = assess(mission({ primaryObjective }))
    for (const quantity of quantities) {
      const actual = assess(mission({ primaryObjective: { ...primaryObjective, [field]: quantity } }))
      expect([actual.small, actual.full]).toEqual([expected.small, expected.full])
    }
  })

  it.each<DeepDiveWarning | null>([null, 'Swarmageddon', 'MacteraPlague', 'LowOxygen'])(
    'preserves Contested Escort under %s and Blood Sugar',
    (warning) => {
      const target = mission({ primaryObjective: { kind: 'EscortDuty', refuels: 1 }, warning, anomaly: 'BloodSugar' })
      expect(assess(target, contested())).toMatchObject({ small: 'Demanding', full: 'Demanding' })
    },
  )

  it.each<DeepDiveAnomaly>(['BloodSugar', 'CriticalWeakness', 'LowGravity', 'VolatileGuts', 'RichAtmosphere'])(
    'does not invent a global %s grade change',
    (anomaly) => {
      expect(assess(mission({ anomaly }))).toMatchObject({ small: 'Easy', full: 'Easy' })
      expect(
        assess(mission({ primaryObjective: { kind: 'Elimination', dreadnoughts: ['Hiveguard'] }, anomaly })),
      ).toMatchObject({ small: 'Demanding', full: 'Manageable' })
    },
  )

  it('retains the independent Low Oxygen floor on wire-valid-only Blood Sugar Salvage', () => {
    const result = assess(
      mission({
        primaryObjective: { kind: 'SalvageOperation', miniMules: 2 },
        warning: 'LowOxygen',
        anomaly: 'BloodSugar',
      }),
    )
    expect(result).toMatchObject({ small: 'Manageable', full: 'Manageable' })
  })

  it('local healing removes only Salvage and Black Box pressure', () => {
    expect(
      assess(mission({ primaryObjective: { kind: 'SalvageOperation', miniMules: 2 }, anomaly: 'BloodSugar' })),
    ).toMatchObject({ small: 'Easy', full: 'Easy' })
    expect(
      assess(mission({ secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 }, anomaly: 'BloodSugar' })),
    ).toMatchObject({ small: 'Easy', full: 'Easy' })
    expect(
      assess(
        mission({
          primaryObjective: { kind: 'SalvageOperation', miniMules: 2 },
          warning: 'Swarmageddon',
          anomaly: 'BloodSugar',
        }),
      ),
    ).toMatchObject({ small: 'Manageable', full: 'Manageable' })
    expect(assess(mission({ warning: 'HauntedCave', anomaly: 'BloodSugar' }))).toMatchObject({
      small: 'Brutal',
      full: 'Demanding',
    })
  })

  it.each<DeepDiveWarning | null>([
    null,
    'ShieldDisruption',
    'MacteraPlague',
    'Swarmageddon',
    'DuckAndCover',
    'HauntedCave',
  ])('folds recovery from Blood Sugar Salvage with %s', (warning) => {
    const previous = mission({
      primaryObjective: { kind: 'SalvageOperation', miniMules: 2 },
      warning,
      anomaly: 'BloodSugar',
    })
    const stage = assess(mission({ primaryObjective: { kind: 'PointExtraction', aquarqs: 7 } }), previous)
    expect([stage.small, stage.full]).toEqual(
      warning === 'DuckAndCover' || warning === 'HauntedCave' ? ['Demanding', 'Manageable'] : ['Manageable', 'Easy'],
    )
  })

  it('takes the median independently for each crew profile', () => {
    const result = buildIntel(
      dive([
        mission({ primaryObjective: { kind: 'Elimination', dreadnoughts: ['Hiveguard'] } }),
        mission({ primaryObjective: { kind: 'Elimination', dreadnoughts: ['Hiveguard'] } }),
        mission({ warning: 'ShieldDisruption' }),
      ]),
      'normal',
    )
    expect(result.overall).toEqual({ small: 'Demanding', full: 'Manageable' })
  })

  it('keeps stage grades separate from overall medians', () => {
    const extraction = mission({ primaryObjective: { kind: 'PointExtraction', aquarqs: 7 } })
    const result = buildIntel(
      dive([extraction, mission({ secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 } }), extraction]),
      'normal',
    )
    expect(result.overall).toEqual({ small: 'Manageable', full: 'Easy' })
    expect(result.stages.map(({ small, full }) => [small, full])).toEqual([
      ['Demanding', 'Easy'],
      ['Manageable', 'Manageable'],
      ['Manageable', 'Easy'],
    ])
  })

  it('keeps a consistently demanding Dive at the same overall grade', () => {
    const target = mission({ warning: 'ShieldDisruption' })
    const result = buildIntel(dive([target, target, target]), 'normal')
    expect(result.overall).toEqual({ small: 'Demanding', full: 'Demanding' })
  })

  it('takes the strongest independent pressure without stacking grades', () => {
    const target = mission({
      primaryObjective: { kind: 'IndustrialSabotage', powerStations: 2 },
      secondaryObjective: { kind: 'Elimination', dreadnoughts: ['Hiveguard'] },
      warning: 'ShieldDisruption',
    })
    const result = assess(target)
    expect(result).toMatchObject({ small: 'Brutal', full: 'Demanding' })
  })

  it('canonicalizes duplicate and permuted Dreadnoughts', () => {
    const target = (dreadnoughts: Extract<DeepDivePrimaryObjective, { kind: 'Elimination' }>['dreadnoughts']) =>
      dive([mission({ primaryObjective: { kind: 'Elimination', dreadnoughts } }), mission(), mission()])
    expect(buildIntel(target(['Classic', 'Hiveguard']), 'normal')).toEqual(
      buildIntel(target(['Hiveguard', 'Classic', 'Hiveguard']), 'normal'),
    )
    expect(buildIntel(target(['Classic']), 'normal')).toEqual(
      buildIntel(target(['Twins', 'Classic', 'Twins']), 'normal'),
    )
  })

  it('keeps grades independent of biome and blanket Elite promotion', () => {
    const source = dive([mission({ warning: 'MacteraPlague' }), mission(), mission()])
    expect(buildIntel(source, 'normal')).toEqual(buildIntel({ ...source, biome: 'MagmaCore' }, 'elite'))
  })

  it('assesses the pinned facade oracle without reclassifying its inputs', () => {
    const normal = buildIntel(generatedSeedZero.dives.normal, 'normal')
    const elite = buildIntel(generatedSeedZero.dives.elite, 'elite')
    expect(normal.stages.map(({ small, full }) => [small, full])).toEqual([
      ['Manageable', 'Manageable'],
      ['Easy', 'Easy'],
      ['Easy', 'Easy'],
    ])
    expect(normal.overall).toEqual({ small: 'Easy', full: 'Easy' })

    expect(elite.stages.map(({ small, full }) => [small, full])).toEqual([
      ['Manageable', 'Manageable'],
      ['Manageable', 'Manageable'],
      ['Demanding', 'Manageable'],
    ])
  })

  it('covers every supported catalogue value with complete Crew grades', () => {
    const primary: { [K in DeepDivePrimaryObjective['kind']]: Extract<DeepDivePrimaryObjective, { kind: K }> } = {
      MiningExpedition: { kind: 'MiningExpedition', morkite: 200 },
      EggHunt: { kind: 'EggHunt', eggs: 4 },
      DeepScan: { kind: 'DeepScan', resonanceCrystals: 3 },
      HeavyExtraction: { kind: 'HeavyExtraction', resiniteMasses: 3 },
      OnSiteRefining: { kind: 'OnSiteRefining', morkiteWells: 3 },
      SalvageOperation: { kind: 'SalvageOperation', miniMules: 2 },
      PointExtraction: { kind: 'PointExtraction', aquarqs: 7 },
      EscortDuty: { kind: 'EscortDuty', refuels: 1 },
      Elimination: { kind: 'Elimination', dreadnoughts: ['Classic', 'Twins'] },
      IndustrialSabotage: { kind: 'IndustrialSabotage', powerStations: 2 },
    }
    const secondary: { [K in DeepDiveSecondaryObjective['kind']]: Extract<DeepDiveSecondaryObjective, { kind: K }> } = {
      MiningExpedition: { kind: 'MiningExpedition', morkite: 150 },
      EggHunt: { kind: 'EggHunt', eggs: 2 },
      DeepScan: { kind: 'DeepScan', resonanceCrystals: 2 },
      HeavyExtraction: { kind: 'HeavyExtraction', resiniteMasses: 1 },
      OnSiteRefining: { kind: 'OnSiteRefining', morkiteWells: 1 },
      SalvageOperation: { kind: 'SalvageOperation', miniMules: 2 },
      Elimination: { kind: 'Elimination', dreadnoughts: ['Classic'] },
      Blackbox: { kind: 'Blackbox', blackBoxes: 1 },
    }
    const warnings: Record<DeepDiveWarning, true> = {
      HauntedCave: true,
      DuckAndCover: true,
      ShieldDisruption: true,
      CaveLeechCluster: true,
      LowOxygen: true,
      EliteThreat: true,
      LethalEnemies: true,
      RivalPresence: true,
      MacteraPlague: true,
      ExploderInfestation: true,
      Swarmageddon: true,
      ScrabNestingGrounds: true,
      PitJawColony: true,
      EboniteOutbreak: true,
      Parasites: true,
      RegenerativeBugs: true,
    }
    const anomalies: Record<DeepDiveAnomaly, true> = {
      BloodSugar: true,
      RichAtmosphere: true,
      CriticalWeakness: true,
      LowGravity: true,
      VolatileGuts: true,
    }
    const shapes = [
      ...Object.values(primary).map((primaryObjective) => mission({ primaryObjective })),
      ...Object.values(secondary).map((secondaryObjective) => mission({ secondaryObjective })),
      ...Object.keys(warnings).map((warning) => mission({ warning: warning as DeepDiveWarning })),
      ...Object.keys(anomalies).map((anomaly) => mission({ anomaly: anomaly as DeepDiveAnomaly })),
    ]
    for (const shape of shapes) {
      const result = buildIntel(dive([shape, mission(), mission()]), 'normal')
      expect(result.stages).toHaveLength(3)
      for (const stage of result.stages) {
        expect(['Easy', 'Manageable', 'Demanding', 'Brutal']).toContain(stage.small)
        expect(['Easy', 'Manageable', 'Demanding', 'Brutal']).toContain(stage.full)
      }
    }
  })

  it.each<[DeepDivePrimaryObjective, DeepDiveWarning, Difficulty, Difficulty]>([
    [{ kind: 'PointExtraction', aquarqs: 7 }, 'HauntedCave', 'Brutal', 'Demanding'],
    [{ kind: 'SalvageOperation', miniMules: 2 }, 'DuckAndCover', 'Demanding', 'Demanding'],
    [{ kind: 'SalvageOperation', miniMules: 2 }, 'ShieldDisruption', 'Demanding', 'Demanding'],
    [{ kind: 'SalvageOperation', miniMules: 2 }, 'ExploderInfestation', 'Manageable', 'Manageable'],
    [{ kind: 'SalvageOperation', miniMules: 2 }, 'Swarmageddon', 'Manageable', 'Manageable'],
    [{ kind: 'EscortDuty', refuels: 1 }, 'MacteraPlague', 'Demanding', 'Manageable'],
    [{ kind: 'EscortDuty', refuels: 1 }, 'ShieldDisruption', 'Demanding', 'Demanding'],
    [{ kind: 'EscortDuty', refuels: 1 }, 'ExploderInfestation', 'Demanding', 'Manageable'],
    [{ kind: 'Elimination', dreadnoughts: ['Classic', 'Twins'] }, 'RegenerativeBugs', 'Manageable', 'Manageable'],
  ])('keeps %j with %s at its named band', (primaryObjective, warning, small, full) => {
    expect(assess(mission({ primaryObjective, warning }))).toMatchObject({ small, full })
  })

  it.each<[DeepDiveWarning, Difficulty, Difficulty]>([
    ['DuckAndCover', 'Demanding', 'Demanding'],
    ['MacteraPlague', 'Demanding', 'Manageable'],
    ['ShieldDisruption', 'Demanding', 'Demanding'],
    ['ExploderInfestation', 'Manageable', 'Manageable'],
  ])('applies %s to a secondary Black Box presence gate', (warning, small, full) => {
    expect(assess(mission({ secondaryObjective: { kind: 'Blackbox', blackBoxes: 1 }, warning }))).toMatchObject({
      small,
      full,
    })
  })

  it.each<[DeepDivePrimaryObjective, Difficulty, Difficulty]>([
    [{ kind: 'MiningExpedition', morkite: 400 }, 'Manageable', 'Easy'],
    [{ kind: 'EggHunt', eggs: 8 }, 'Manageable', 'Easy'],
    [{ kind: 'DeepScan', resonanceCrystals: 5 }, 'Manageable', 'Easy'],
    [{ kind: 'HeavyExtraction', resiniteMasses: 4 }, 'Manageable', 'Easy'],
    [{ kind: 'OnSiteRefining', morkiteWells: 3 }, 'Manageable', 'Easy'],
    [{ kind: 'IndustrialSabotage', powerStations: 2 }, 'Manageable', 'Easy'],
    [{ kind: 'PointExtraction', aquarqs: 7 }, 'Demanding', 'Manageable'],
    [{ kind: 'Elimination', dreadnoughts: ['Classic', 'Twins'] }, 'Demanding', 'Manageable'],
    [{ kind: 'SalvageOperation', miniMules: 2 }, 'Demanding', 'Manageable'],
    [{ kind: 'EscortDuty', refuels: 1 }, 'Demanding', 'Manageable'],
  ])('folds the clean %j exit into the next Mission', (primaryObjective, small, full) => {
    expect(
      assess(mission({ primaryObjective: { kind: 'PointExtraction', aquarqs: 7 } }), mission({ primaryObjective })),
    ).toMatchObject({ small, full })
  })

  it.each<DeepDiveWarning>(['DuckAndCover', 'HauntedCave'])('%s contests an otherwise usable reserve', (warning) => {
    expect(
      assess(mission({ primaryObjective: { kind: 'PointExtraction', aquarqs: 7 } }), mission({ warning })),
    ).toMatchObject({ small: 'Demanding', full: 'Manageable' })
  })

  it('keeps Low Oxygen Refining banked and Escort reserves contested', () => {
    const extraction = mission({ primaryObjective: { kind: 'PointExtraction', aquarqs: 7 } })
    expect(
      assess(
        extraction,
        mission({ primaryObjective: { kind: 'OnSiteRefining', morkiteWells: 3 }, warning: 'LowOxygen' }),
      ),
    ).toMatchObject({ small: 'Manageable', full: 'Easy' })
    const result = buildIntel(
      dive([
        mission({ primaryObjective: { kind: 'EscortDuty', refuels: 2 } }),
        mission({ primaryObjective: { kind: 'PointExtraction', aquarqs: 7 }, warning: 'LowOxygen' }),
        mission(),
      ]),
      'normal',
    )
    expect(result.stages[1]).toMatchObject({ small: 'Brutal', full: 'Brutal' })
    expect(result.stages[2]).toMatchObject({ small: 'Easy', full: 'Easy' })
  })

  it('does not grant a Drillevator or presence radius to reduced secondary work', () => {
    for (const secondaryObjective of [
      { kind: 'DeepScan', resonanceCrystals: 2 },
      { kind: 'SalvageOperation', miniMules: 2 },
      { kind: 'OnSiteRefining', morkiteWells: 1 },
    ] satisfies DeepDiveSecondaryObjective[]) {
      const result = assess(mission({ secondaryObjective, warning: 'MacteraPlague' }))
      expect(result).toMatchObject({ small: 'Manageable', full: 'Manageable' })
    }
  })

  it('does not retroactively recover a Contested entry from local healing or faster hauling', () => {
    const target = mission({
      primaryObjective: { kind: 'EscortDuty', refuels: 2 },
      anomaly: 'BloodSugar',
      warning: 'DuckAndCover',
    })
    expect(assess(target, contested())).toMatchObject({ small: 'Brutal', full: 'Demanding' })
    const boss = mission({
      primaryObjective: { kind: 'PointExtraction', aquarqs: 7 },
      secondaryObjective: { kind: 'Elimination', dreadnoughts: ['Twins'] },
      anomaly: 'BloodSugar',
    })
    expect(assess(boss, contested())).toMatchObject({ small: 'Brutal', full: 'Brutal' })
  })
})

function mission(overrides: Partial<DeepDiveMission> = {}): DeepDiveMission {
  return {
    primaryObjective: { kind: 'MiningExpedition', morkite: 200 },
    secondaryObjective: { kind: 'EggHunt', eggs: 2 },
    warning: null,
    anomaly: null,
    ...overrides,
  }
}

function dive(missions: DeepDive['missions'] = [mission(), mission(), mission()]): DeepDive {
  return { name: 'Test Dive', biome: 'CrystallineCaverns', missions }
}

function assess(target: DeepDiveMission, previous?: DeepDiveMission) {
  return buildIntel(dive(previous ? [previous, target, mission()] : [target, mission(), mission()]), 'normal').stages[
    previous ? 1 : 0
  ]
}

function contested(): DeepDiveMission {
  return mission({ primaryObjective: { kind: 'Elimination', dreadnoughts: ['Classic', 'Twins'] } })
}
