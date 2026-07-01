import { describe, expect, it } from 'vitest'
import type { DeepDive, DeepDiveMission } from '~/shared/api'
import { buildIntel, type IntelNote } from './intel'

describe('buildIntel', () => {
  it('selects Haunted Cave over any anomaly', () => {
    const dive = createDive([
      createMission({ anomaly: 'BloodSugar' }),
      createMission({ warning: 'HauntedCave' }),
      createMission({ anomaly: 'VolatileGuts' }),
    ])

    const intel = buildIntel(dive, 'normal')

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

    expect(buildIntel(dive, 'normal')).toEqual({
      note: 'duck-and-cover-fixed',
    })
  })

  it('does not treat Elimination ranged pressure as a fixed Duck and Cover hold', () => {
    const dive = createDive([
      createMission({
        primaryObjective: {
          dreadnoughts: ['Classic'],
          kind: 'Elimination',
        },
        warning: 'DuckAndCover',
      }),
      createMission(),
      createMission(),
    ])

    expect(buildIntel(dive, 'normal')).toEqual({
      note: 'duck-and-cover',
    })
  })

  it('does not treat a clean Elimination route as a fixed objective fallback', () => {
    const dive = createDive([
      createMission({
        primaryObjective: {
          dreadnoughts: ['Classic'],
          kind: 'Elimination',
        },
      }),
      createMission(),
      createMission(),
    ])

    expect(buildIntel(dive, 'normal')).toEqual({
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

    expect(buildIntel(primaryDeepScanDive, 'normal').note).toBe('low-oxygen-long-route')
    expect(buildIntel(secondaryDeepScanDive, 'normal').note).toBe('low-oxygen')
  })

  it('selects explicit dangerous anomaly notes when no stronger warning exists', () => {
    expect(
      buildIntel(createDive([createMission({ anomaly: 'BloodSugar' }), createMission(), createMission()]), 'normal'),
    ).toMatchObject({
      note: 'blood-sugar',
    })
    expect(
      buildIntel(createDive([createMission({ anomaly: 'VolatileGuts' }), createMission(), createMission()]), 'normal'),
    ).toMatchObject({
      note: 'volatile-guts',
    })
  })

  it('keeps pressure warning notes specific instead of using one generic line', () => {
    expect(
      buildIntel(
        createDive([createMission({ warning: 'ScrabNestingGrounds' }), createMission(), createMission()]),
        'normal',
      ).note,
    ).toBe('scrab-nesting-grounds')
    expect(
      buildIntel(
        createDive([createMission({ warning: 'ExploderInfestation' }), createMission(), createMission()]),
        'normal',
      ).note,
    ).toBe('exploder-infestation')
    expect(
      buildIntel(createDive([createMission({ warning: 'Parasites' }), createMission(), createMission()]), 'normal')
        .note,
    ).toBe('parasites')
  })

  it('does not treat beneficial anomalies as pressure notes', () => {
    const intel = buildIntel(
      createDive([createMission({ anomaly: 'CriticalWeakness' }), createMission(), createMission()]),
      'normal',
    )

    expect(intel).toEqual({
      note: 'favorable-critical-weakness',
    })
  })

  it('uses mobility anomalies as favorable route guidance', () => {
    expect(
      buildIntel(createDive([createMission({ anomaly: 'LowGravity' }), createMission(), createMission()]), 'normal'),
    ).toEqual({
      note: 'favorable-mobility',
    })
    expect(
      buildIntel(
        createDive([createMission({ anomaly: 'RichAtmosphere' }), createMission(), createMission()]),
        'normal',
      ),
    ).toEqual({
      note: 'favorable-mobility',
    })
  })

  it('keeps favorable anomaly guidance ahead of fixed objective fallback', () => {
    const dive = createDive([
      createMission({
        anomaly: 'RichAtmosphere',
        primaryObjective: {
          kind: 'EscortDuty',
          refuels: 1,
        },
      }),
      createMission(),
      createMission(),
    ])

    expect(buildIntel(dive, 'normal')).toEqual({
      note: 'favorable-mobility',
    })
  })

  it('maps every remaining warning straight to its dedicated note', () => {
    const directNotes: Record<string, IntelNote> = {
      CaveLeechCluster: 'cave-leech-cluster',
      EboniteOutbreak: 'ebonite-outbreak',
      EliteThreat: 'elite-threat',
      LethalEnemies: 'lethal-enemies',
      MacteraPlague: 'mactera-plague',
      PitJawColony: 'pit-jaw-colony',
      RegenerativeBugs: 'regenerative-bugs',
      RivalPresence: 'rival-presence',
      ShieldDisruption: 'shield-disruption',
      Swarmageddon: 'swarmageddon',
    }

    for (const [warning, note] of Object.entries(directNotes)) {
      const dive = createDive([
        createMission({ warning: warning as DeepDiveMission['warning'] }),
        createMission(),
        createMission(),
      ])

      expect(buildIntel(dive, 'normal').note).toBe(note)
    }
  })

  it('keeps elite clean fallback sharper than normal clean fallback', () => {
    const dive = createDive([createMission(), createMission(), createMission()])

    expect(buildIntel(dive, 'normal')).toEqual({
      note: 'clean-normal',
    })
    expect(buildIntel(dive, 'elite')).toEqual({
      note: 'clean-elite',
    })
  })
})

function createDive(missions: [DeepDiveMission, DeepDiveMission, DeepDiveMission]): DeepDive {
  return {
    biome: 'AzureWeald',
    missions,
    name: 'Test Route',
  }
}

function createMission(overrides: Partial<DeepDiveMission> = {}): DeepDiveMission {
  return {
    anomaly: null,
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
