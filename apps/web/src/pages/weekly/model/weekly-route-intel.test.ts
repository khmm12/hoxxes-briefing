import { describe, expect, it } from 'vitest'
import type { WeeklyDive, WeeklyMission } from './weekly-route-catalog'
import { buildWeeklyRouteIntel } from './weekly-route-intel'

describe('buildWeeklyRouteIntel', () => {
  it('selects Haunted Cave over any mutator', () => {
    const dive = createDive([
      createMission({ mutator: 'BloodSugar' }),
      createMission({ warning: 'HauntedCave' }),
      createMission({ mutator: 'VolatileGuts' }),
    ])

    const intel = buildWeeklyRouteIntel(dive, 'normal')

    expect(intel).toEqual({
      note: 'haunted-cave',
    })
  })

  it('adjusts Duck and Cover advice for fixed objective context', () => {
    const dive = createDive([
      createMission({
        primaryObjective: {
          kind: 'EscortDuty',
          refuels: 1,
        },
        warning: 'DuckAndCover',
      }),
      createMission(),
      createMission(),
    ])

    expect(buildWeeklyRouteIntel(dive, 'normal')).toEqual({
      note: 'duck-and-cover-fixed',
    })
  })

  it('does not treat Elimination ranged pressure as a fixed Duck and Cover hold', () => {
    const dive = createDive([
      createMission({
        primaryObjective: {
          dreadnoughts: ['Dreadnought'],
          kind: 'Elimination',
        },
        warning: 'DuckAndCover',
      }),
      createMission(),
      createMission(),
    ])

    expect(buildWeeklyRouteIntel(dive, 'normal')).toEqual({
      note: 'duck-and-cover',
    })
  })

  it('does not treat a clean Elimination route as a fixed objective fallback', () => {
    const dive = createDive([
      createMission({
        primaryObjective: {
          dreadnoughts: ['Dreadnought'],
          kind: 'Elimination',
        },
      }),
      createMission(),
      createMission(),
    ])

    expect(buildWeeklyRouteIntel(dive, 'normal')).toEqual({
      note: 'clean-normal',
    })
  })

  it('uses primary objective context for Low Oxygen instead of flattening secondary variants', () => {
    const primaryDeepScanDive = createDive([
      createMission({
        primaryObjective: {
          kind: 'DeepScan',
          resonanceCrystals: 3,
        },
        secondaryObjective: {
          kind: 'MiningExpedition',
          morkite: 150,
        },
        warning: 'LowOxygen',
      }),
      createMission(),
      createMission(),
    ])
    const secondaryDeepScanDive = createDive([
      createMission({
        primaryObjective: {
          eggs: 4,
          kind: 'EggHunt',
        },
        secondaryObjective: {
          kind: 'DeepScan',
          resonanceCrystals: 2,
        },
        warning: 'LowOxygen',
      }),
      createMission(),
      createMission(),
    ])

    expect(buildWeeklyRouteIntel(primaryDeepScanDive, 'normal').note).toBe('low-oxygen-long-route')
    expect(buildWeeklyRouteIntel(secondaryDeepScanDive, 'normal').note).toBe('low-oxygen')
  })

  it('selects explicit dangerous mutator notes when no stronger warning exists', () => {
    expect(
      buildWeeklyRouteIntel(
        createDive([createMission({ mutator: 'BloodSugar' }), createMission(), createMission()]),
        'normal',
      ),
    ).toMatchObject({
      note: 'blood-sugar',
    })
    expect(
      buildWeeklyRouteIntel(
        createDive([createMission({ mutator: 'VolatileGuts' }), createMission(), createMission()]),
        'normal',
      ),
    ).toMatchObject({
      note: 'volatile-guts',
    })
  })

  it('keeps pressure warning notes specific instead of using one generic line', () => {
    expect(
      buildWeeklyRouteIntel(
        createDive([createMission({ warning: 'ScrabNestingGrounds' }), createMission(), createMission()]),
        'normal',
      ).note,
    ).toBe('scrab-nesting-grounds')
    expect(
      buildWeeklyRouteIntel(
        createDive([createMission({ warning: 'ExploderInfestation' }), createMission(), createMission()]),
        'normal',
      ).note,
    ).toBe('exploder-infestation')
    expect(
      buildWeeklyRouteIntel(
        createDive([createMission({ warning: 'Parasites' }), createMission(), createMission()]),
        'normal',
      ).note,
    ).toBe('parasites')
  })

  it('does not treat beneficial mutators as pressure notes', () => {
    const intel = buildWeeklyRouteIntel(
      createDive([createMission({ mutator: 'CriticalWeakness' }), createMission(), createMission()]),
      'normal',
    )

    expect(intel).toEqual({
      note: 'favorable-critical-weakness',
    })
  })

  it('uses mobility mutators as favorable route guidance', () => {
    expect(
      buildWeeklyRouteIntel(
        createDive([createMission({ mutator: 'LowGravity' }), createMission(), createMission()]),
        'normal',
      ),
    ).toEqual({
      note: 'favorable-mobility',
    })
    expect(
      buildWeeklyRouteIntel(
        createDive([createMission({ mutator: 'RichAtmosphere' }), createMission(), createMission()]),
        'normal',
      ),
    ).toEqual({
      note: 'favorable-mobility',
    })
  })

  it('keeps favorable mutator guidance ahead of fixed objective fallback', () => {
    const dive = createDive([
      createMission({
        mutator: 'RichAtmosphere',
        primaryObjective: {
          kind: 'EscortDuty',
          refuels: 1,
        },
      }),
      createMission(),
      createMission(),
    ])

    expect(buildWeeklyRouteIntel(dive, 'normal')).toEqual({
      note: 'favorable-mobility',
    })
  })

  it('keeps elite clean fallback sharper than normal clean fallback', () => {
    const dive = createDive([createMission(), createMission(), createMission()])

    expect(buildWeeklyRouteIntel(dive, 'normal')).toEqual({
      note: 'clean-normal',
    })
    expect(buildWeeklyRouteIntel(dive, 'elite')).toEqual({
      note: 'clean-elite',
    })
  })
})

function createDive(missions: [WeeklyMission, WeeklyMission, WeeklyMission]): WeeklyDive {
  return {
    biome: 'AzureWeald',
    missions,
    name: 'Test Route',
  }
}

function createMission(overrides: Partial<WeeklyMission> = {}): WeeklyMission {
  return {
    mutator: null,
    primaryObjective: {
      kind: 'MiningExpedition',
      morkite: 200,
    },
    secondaryObjective: {
      kind: 'MiningExpedition',
      morkite: 150,
    },
    warning: null,
    ...overrides,
  }
}
