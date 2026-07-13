import { describe, expect, it } from 'vitest'
import type { I18n } from '@lingui/core'
import { parseISO } from 'date-fns'
import type {
  Briefing,
  DeepDive,
  DeepDiveMission,
  DeepDivePrimaryObjective,
  DeepDiveSecondaryObjective,
} from '~/shared/api'
import { canonicalUrl } from '~/shared/config'
import { getDateTimeFormat } from '~/shared/i18n'
import { createTestI18n } from '~test/render'
import { buildIntel } from '../../model/intel'
import { formatIntelNote } from '../dive/intel-copy'
import { buildShareText } from './build-share-text'

const i18n: I18n = createTestI18n()

const RELEASE = '2026-07-11T11:00:00.000Z'
const EXPIRATION = '2026-07-18T11:00:00.000Z'

describe('buildShareText', () => {
  it('leads with a "Deep Dives" header carrying the briefing date range', () => {
    const header = buildShareText(i18n, createBriefing()).split('\n')[0]
    const range = getDateTimeFormat(i18n.locale, { day: 'numeric', month: 'short' }).formatRange(
      parseISO(RELEASE),
      parseISO(EXPIRATION),
    )

    expect(header).toBe(`Deep Dives · ${range}`)
  })

  it('labels the two dives by kind, name, and biome', () => {
    const text = buildShareText(
      i18n,
      createBriefing({
        dives: {
          normal: createDive({ name: 'Unknown Comeback', biome: 'AzureWeald' }),
          elite: createDive({ name: 'Clean Bed', biome: 'SandblastedCorridors' }),
        },
      }),
    )

    expect(text).toContain('⛏️ DEEP DIVE · Unknown Comeback · Azure Weald')
    expect(text).toContain('☠️ ELITE DEEP DIVE · Clean Bed · Sandblasted Corridors')
  })

  it('numbers the three stages of each dive', () => {
    const lines = buildShareText(i18n, createBriefing()).split('\n')

    expect(lines.filter((line) => /^1\. /.test(line))).toHaveLength(2)
    expect(lines.filter((line) => /^2\. /.test(line))).toHaveLength(2)
    expect(lines.filter((line) => /^3\. /.test(line))).toHaveLength(2)
  })

  it('separates blocks with a blank line', () => {
    expect(buildShareText(i18n, createBriefing())).toContain('\n\n')
  })

  describe('objective phrasing', () => {
    const primaries: Array<[DeepDivePrimaryObjective, string]> = [
      [{ kind: 'MiningExpedition', morkite: 250 }, '⛏️ Morkite x250'],
      [{ kind: 'EggHunt', eggs: 6 }, '🥚 Egg x6'],
      [{ kind: 'DeepScan', resonanceCrystals: 3 }, '🔍 Deep Scan x3'],
      [{ kind: 'PointExtraction', aquarqs: 10 }, '🔷 Aquarq x10'],
      [{ kind: 'OnSiteRefining', morkiteWells: 2 }, '🛢️ Morkite Well x2'],
      [{ kind: 'SalvageOperation', miniMules: 3 }, '🤖 Mule x3'],
      [{ kind: 'HeavyExtraction', resiniteMasses: 2 }, '📦 Resinite Mass x2'],
      [{ kind: 'Elimination', dreadnoughts: ['Twins'] }, '☠️ Dreadnought x1 (Twins)'],
      [{ kind: 'EscortDuty', refuels: 2 }, '🚜 Escort Duty'],
      [{ kind: 'IndustrialSabotage', powerStations: 2 }, '🏭 Industrial Sabotage'],
    ]

    it.each(primaries)('formats primary %o', (objective, expected) => {
      expect(firstStageLine(createBriefing(withPrimary(objective)))).toContain(expected)
    })

    it('formats the secondary-only Black Box objective', () => {
      expect(firstStageLine(createBriefing(withSecondary({ kind: 'Blackbox', blackBoxes: 1 })))).toContain(
        '🗃️ Black Box',
      )
    })

    it('joins primary and secondary with " + "', () => {
      const line = firstStageLine(
        createBriefing(
          withMission({
            primaryObjective: { kind: 'MiningExpedition', morkite: 250 },
            secondaryObjective: { kind: 'EggHunt', eggs: 6 },
          }),
        ),
      )

      expect(line).toContain('⛏️ Morkite x250 + 🥚 Egg x6')
    })

    it('lists every dreadnought variant for Elimination', () => {
      const line = firstStageLine(
        createBriefing(withPrimary({ kind: 'Elimination', dreadnoughts: ['Classic', 'Hiveguard', 'Twins'] })),
      )

      expect(line).toContain('☠️ Dreadnought x3 (Classic + Hiveguard + Twins)')
    })
  })

  describe('intel', () => {
    it('lands each dive Intel note behind the 💡 marker inside its own block', () => {
      // Distinct names let us pin the note to its block; identical clean dives
      // still resolve to different notes (clean-normal vs clean-elite), so a
      // normal/elite kind swap in the block builder would fail this.
      const briefing = createBriefing({
        dives: {
          normal: createDive({ name: 'Standard Run' }),
          elite: createDive({ name: 'Elite Run' }),
        },
      })
      const blocks = buildShareText(i18n, briefing).split('\n\n')
      const normalBlock = blocks.find((block) => block.includes('Standard Run'))
      const eliteBlock = blocks.find((block) => block.includes('Elite Run'))

      expect(normalBlock).toContain(`💡 ${formatIntelNote(i18n, buildIntel(briefing.dives.normal, 'normal'))}`)
      expect(eliteBlock).toContain(`💡 ${formatIntelNote(i18n, buildIntel(briefing.dives.elite, 'elite'))}`)
    })

    it('places the Intel note above the stage lines', () => {
      const lines = buildShareText(i18n, createBriefing()).split('\n')
      const intelIndex = lines.findIndex((line) => line.startsWith('💡'))
      const firstStageIndex = lines.findIndex((line) => line.startsWith('1. '))

      expect(intelIndex).toBeGreaterThanOrEqual(0)
      expect(intelIndex).toBeLessThan(firstStageIndex)
    })
  })

  describe('mutators', () => {
    it('appends a warning behind the ⚠️ marker', () => {
      const line = firstStageLine(createBriefing(withMission({ warning: 'Parasites', anomaly: null })))

      expect(line).toContain(' · ⚠️ Parasites')
      expect(line).not.toContain('✨')
    })

    it('appends an anomaly behind the ✨ marker', () => {
      const line = firstStageLine(createBriefing(withMission({ warning: null, anomaly: 'CriticalWeakness' })))

      expect(line).toContain(' · ✨ Critical Weakness')
      expect(line).not.toContain('⚠️')
    })

    it('carries both a warning and an anomaly on one stage', () => {
      const line = firstStageLine(createBriefing(withMission({ warning: 'LethalEnemies', anomaly: 'RichAtmosphere' })))

      expect(line).toContain('· ⚠️ Lethal Enemies · ✨ Rich Atmosphere')
    })

    it('omits both markers on a clean stage', () => {
      const line = firstStageLine(createBriefing(withMission({ warning: null, anomaly: null })))

      expect(line).not.toContain('⚠️')
      expect(line).not.toContain('✨')
    })
  })

  describe('confidence', () => {
    it('prepends an advisory caveat when the briefing is unverified', () => {
      const text = buildShareText(i18n, createBriefing({ confidence: 'unverified' }))

      expect(text.startsWith('⚠️ Unverified')).toBe(true)
      expect(text).toContain('Mission Control has not confirmed this briefing yet')
    })

    it('adds no caveat when the briefing is verified', () => {
      const text = buildShareText(i18n, createBriefing({ confidence: 'verified' }))

      expect(text.startsWith('Deep Dives')).toBe(true)
      expect(text).not.toContain('Unverified')
    })
  })

  describe('footer', () => {
    it('closes with the branded footer and the canonical link on its own line', () => {
      const text = buildShareText(i18n, createBriefing())

      expect(text.endsWith(`⛏️ Hoxxes Briefing · Rock and Stone!\n${canonicalUrl}`)).toBe(true)
    })

    it('links the canonical app url, not the running host', () => {
      expect(buildShareText(i18n, createBriefing())).toContain('https://hoxxes-briefing.vercel.app')
    })
  })
})

function firstStageLine(briefing: Briefing): string {
  const line = buildShareText(i18n, briefing)
    .split('\n')
    .find((entry) => entry.startsWith('1. '))

  if (line == null) throw new Error('no first stage line')

  return line
}

function withPrimary(primaryObjective: DeepDivePrimaryObjective): Partial<Briefing> {
  return withMission({ primaryObjective })
}

function withSecondary(secondaryObjective: DeepDiveSecondaryObjective): Partial<Briefing> {
  return withMission({ secondaryObjective })
}

function withMission(overrides: Partial<DeepDiveMission>): Partial<Briefing> {
  return {
    dives: {
      normal: createDive({ missions: [createMission(overrides), createMission(), createMission()] }),
      elite: createDive(),
    },
  }
}

function createBriefing(overrides: Partial<Briefing> = {}): Briefing {
  return {
    seed: 1,
    confidence: 'verified',
    release: RELEASE,
    expiration: EXPIRATION,
    dives: {
      normal: createDive(),
      elite: createDive(),
    },
    ...overrides,
  }
}

function createDive(overrides: Partial<DeepDive> = {}): DeepDive {
  return {
    name: 'Test Dive',
    biome: 'AzureWeald',
    missions: [createMission(), createMission(), createMission()],
    ...overrides,
  }
}

function createMission(overrides: Partial<DeepDiveMission> = {}): DeepDiveMission {
  return {
    primaryObjective: { kind: 'MiningExpedition', morkite: 100 },
    secondaryObjective: { kind: 'EggHunt', eggs: 2 },
    warning: null,
    anomaly: null,
    ...overrides,
  }
}
