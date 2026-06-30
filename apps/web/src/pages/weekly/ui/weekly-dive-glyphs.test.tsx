import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import type { WeeklySnapshotResult } from '~/shared/api'
import {
  BiomeKindIcon,
  MutatorKindIcon,
  PrimaryObjectiveKindIcon,
  SecondaryObjectiveKindIcon,
  WarningKindIcon,
} from './weekly-dive-glyphs'

type WeeklyDive = WeeklySnapshotResult['dives']['normal']
type WeeklyMission = WeeklyDive['missions'][number]
type PrimaryObjectiveKind = WeeklyMission['primaryObjective']['kind']
type SecondaryObjectiveKind = WeeklyMission['secondaryObjective']['kind']
type WarningKind = NonNullable<WeeklyMission['warning']>
type MutatorKind = NonNullable<WeeklyMission['mutator']>
type BiomeKind = WeeklyDive['biome']

function renderedGlyphPath(ui: () => ReturnType<typeof PrimaryObjectiveKindIcon>): string {
  const { container } = render(ui)
  const path = container.querySelector('path')

  expect(path).not.toBeNull()
  return path?.getAttribute('d') ?? ''
}

describe('PrimaryObjectiveKindIcon', () => {
  const kinds: PrimaryObjectiveKind[] = [
    'DeepScan',
    'EscortDuty',
    'MiningExpedition',
    'IndustrialSabotage',
    'EggHunt',
    'PointExtraction',
    'OnSiteRefining',
    'SalvageOperation',
    'Elimination',
    'HeavyExtraction',
  ]

  it.each(kinds)('renders a distinct glyph path for %s', (kind) => {
    expect(renderedGlyphPath(() => <PrimaryObjectiveKindIcon kind={kind} />)).not.toBe('')
  })

  it('renders a different path per kind', () => {
    const paths = kinds.map((kind) => renderedGlyphPath(() => <PrimaryObjectiveKindIcon kind={kind} />))

    expect(new Set(paths).size).toBe(kinds.length)
  })
})

describe('SecondaryObjectiveKindIcon', () => {
  const kinds: SecondaryObjectiveKind[] = [
    'EggHunt',
    'DeepScan',
    'Blackbox',
    'Elimination',
    'MiningExpedition',
    'OnSiteRefining',
    'SalvageOperation',
    'HeavyExcavation',
  ]

  it.each(kinds)('renders a glyph path for %s', (kind) => {
    expect(renderedGlyphPath(() => <SecondaryObjectiveKindIcon kind={kind} />)).not.toBe('')
  })

  it('renders a different path per kind', () => {
    const paths = kinds.map((kind) => renderedGlyphPath(() => <SecondaryObjectiveKindIcon kind={kind} />))

    expect(new Set(paths).size).toBe(kinds.length)
  })
})

describe('WarningKindIcon', () => {
  const kinds: WarningKind[] = [
    'RegenerativeBugs',
    'EliteThreat',
    'MacteraPlague',
    'EboniteOutbreak',
    'DuckAndCover',
    'CaveLeechCluster',
    'LowOxygen',
    'ExploderInfestation',
    'HauntedCave',
    'LethalEnemies',
    'ShieldDisruption',
    'Parasites',
    'Swarmageddon',
    'RivalPresence',
    'PitJawColony',
    'ScrabNestingGrounds',
  ]

  it.each(kinds)('renders a glyph path for %s', (kind) => {
    expect(renderedGlyphPath(() => <WarningKindIcon kind={kind} />)).not.toBe('')
  })

  it('renders a different path per kind', () => {
    const paths = kinds.map((kind) => renderedGlyphPath(() => <WarningKindIcon kind={kind} />))

    expect(new Set(paths).size).toBe(kinds.length)
  })

  it('falls back to the generic warning glyph when there is no warning', () => {
    const fallbackPath = renderedGlyphPath(() => <WarningKindIcon kind={null} />)
    const knownPath = renderedGlyphPath(() => <WarningKindIcon kind="EliteThreat" />)

    expect(fallbackPath).not.toBe('')
    expect(fallbackPath).not.toBe(knownPath)
  })
})

describe('MutatorKindIcon', () => {
  const kinds: MutatorKind[] = ['VolatileGuts', 'RichAtmosphere', 'CriticalWeakness', 'BloodSugar', 'LowGravity']

  it.each(kinds)('renders a glyph path for %s', (kind) => {
    expect(renderedGlyphPath(() => <MutatorKindIcon kind={kind} />)).not.toBe('')
  })

  it('renders a different path per kind', () => {
    const paths = kinds.map((kind) => renderedGlyphPath(() => <MutatorKindIcon kind={kind} />))

    expect(new Set(paths).size).toBe(kinds.length)
  })

  it('falls back to the generic mutator glyph when there is no mutator', () => {
    const fallbackPath = renderedGlyphPath(() => <MutatorKindIcon kind={null} />)
    const knownPath = renderedGlyphPath(() => <MutatorKindIcon kind="LowGravity" />)

    expect(fallbackPath).not.toBe('')
    expect(fallbackPath).not.toBe(knownPath)
  })
})

describe('BiomeKindIcon', () => {
  const kinds: BiomeKind[] = [
    'CrystallineCaverns',
    'FungusBogs',
    'MagmaCore',
    'RadioactiveExclusionZone',
    'DenseBiozone',
    'SandblastedCorridors',
    'SaltPits',
    'GlacialStrata',
    'AzureWeald',
    'HollowBough',
    'OssuaryDepths',
  ]

  it.each(kinds)('renders a glyph path for %s', (kind) => {
    expect(renderedGlyphPath(() => <BiomeKindIcon kind={kind} />)).not.toBe('')
  })

  it('renders a different path per kind', () => {
    const paths = kinds.map((kind) => renderedGlyphPath(() => <BiomeKindIcon kind={kind} />))

    expect(new Set(paths).size).toBe(kinds.length)
  })

  it('tints each biome glyph with its own accent color', () => {
    const colors = kinds.map((kind) => {
      const { container } = render(() => <BiomeKindIcon kind={kind} />)
      return container.querySelector('svg')?.style.color ?? ''
    })

    expect(colors.every((color) => color !== '')).toBe(true)
    expect(new Set(colors).size).toBe(kinds.length)
  })
})
