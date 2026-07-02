import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import type { DeepDiveAnomaly, DeepDiveBiome, DeepDiveWarning } from '~/shared/api'
import type { PrimaryObjectiveKind, SecondaryObjectiveKind } from '../model/catalog'
import {
  AnomalyKindIcon,
  BiomeKindIcon,
  PrimaryObjectiveKindIcon,
  SecondaryObjectiveKindIcon,
  WarningKindIcon,
} from './dive-glyphs'

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
    'HeavyExtraction',
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
  const kinds: DeepDiveWarning[] = [
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

describe('AnomalyKindIcon', () => {
  const kinds: DeepDiveAnomaly[] = ['VolatileGuts', 'RichAtmosphere', 'CriticalWeakness', 'BloodSugar', 'LowGravity']

  it.each(kinds)('renders a glyph path for %s', (kind) => {
    expect(renderedGlyphPath(() => <AnomalyKindIcon kind={kind} />)).not.toBe('')
  })

  it('renders a different path per kind', () => {
    const paths = kinds.map((kind) => renderedGlyphPath(() => <AnomalyKindIcon kind={kind} />))

    expect(new Set(paths).size).toBe(kinds.length)
  })

  it('falls back to the generic anomaly glyph when there is no anomaly', () => {
    const fallbackPath = renderedGlyphPath(() => <AnomalyKindIcon kind={null} />)
    const knownPath = renderedGlyphPath(() => <AnomalyKindIcon kind="LowGravity" />)

    expect(fallbackPath).not.toBe('')
    expect(fallbackPath).not.toBe(knownPath)
  })
})

describe('BiomeKindIcon', () => {
  const kinds: DeepDiveBiome[] = [
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
