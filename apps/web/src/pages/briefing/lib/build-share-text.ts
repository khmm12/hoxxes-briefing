import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
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
import { buildIntel, type DiveKind } from '../model/intel'
import {
  formatAnomaly,
  formatBiome,
  formatDiveKind,
  formatPrimaryObjective,
  formatSecondaryObjective,
  formatWarning,
} from '../ui/dive-copy'
import { formatIntelNote } from '../ui/intel-copy'

/**
 * Renders the current Briefing as a self-contained, paste-anywhere text block.
 * Structural emoji only, no markdown, so it degrades cleanly in any chat
 * (Discord, Telegram, SMS). Closes with a branded footer carrying the canonical
 * app link, so the block is complete on its own — the transport adds nothing.
 */
export function buildShareText(i18n: I18n, briefing: Briefing): string {
  const blocks = [
    formatHeader(i18n, briefing),
    formatDiveBlock(i18n, 'normal', briefing.dives.normal),
    formatDiveBlock(i18n, 'elite', briefing.dives.elite),
    formatFooter(i18n),
  ]

  // Progressive degradation: an unverified briefing still shares, but never
  // strips the advisory it carries on screen — the caveat leads the block.
  if (briefing.confidence === 'unverified') {
    blocks.unshift(formatUnverifiedCaveat(i18n))
  }

  return blocks.join('\n\n')
}

type ObjectiveKind = (DeepDivePrimaryObjective | DeepDiveSecondaryObjective)['kind']

// Per objective type, keyed on the closed contract union so a new game value
// cannot compile until its emoji is chosen. Codepoints kept to widely-supported
// glyphs (Emoji 3.0 / 2016 at newest — the 🥚 egg) to avoid tofu on older
// phones and Telegram.
const objectiveEmoji: Record<ObjectiveKind, string> = {
  MiningExpedition: '⛏️',
  EggHunt: '🥚',
  DeepScan: '🔍',
  PointExtraction: '🔷',
  OnSiteRefining: '🛢️',
  SalvageOperation: '🤖',
  Elimination: '☠️',
  HeavyExtraction: '📦',
  EscortDuty: '🚜',
  IndustrialSabotage: '🏭',
  Blackbox: '🗃️',
}

// Dive heading marker: the pickaxe reads as the standard dive, the skull as
// the deadlier elite.
const diveEmoji: Record<DiveKind, string> = {
  normal: '⛏️',
  elite: '☠️',
}

// Mutators ride their tier marker only — a per-mutator emoji set earns nothing
// over the Warning/Anomaly distinction the reader already knows.
const WARNING_MARKER = '⚠️'
const ANOMALY_MARKER = '✨'

// The Intel note is the block's hook — the lightbulb reads as the tip it is.
const INTEL_MARKER = '💡'

const BRAND_MARKER = '⛏️'

function formatFooter(i18n: I18n): string {
  return `${BRAND_MARKER} ${i18n._(msg`Hoxxes Briefing · Rock and Stone!`)}\n${canonicalUrl}`
}

function formatHeader(i18n: I18n, briefing: Briefing): string {
  const range = getDateTimeFormat(i18n.locale, { day: 'numeric', month: 'short' }).formatRange(
    parseISO(briefing.release),
    parseISO(briefing.expiration),
  )

  return `${i18n._(msg`Deep Dives`)} · ${range}`
}

function formatUnverifiedCaveat(i18n: I18n): string {
  return `${WARNING_MARKER} ${i18n._(msg`Unverified — Mission Control has not confirmed this briefing yet, details may change.`)}`
}

function formatDiveBlock(i18n: I18n, kind: DiveKind, dive: DeepDive): string {
  const heading = `${diveEmoji[kind]} ${formatDiveKind(i18n, kind).toUpperCase()} · ${dive.name} · ${formatBiome(i18n, dive.biome)}`
  // Intel leads the block just as it heads the on-screen slab — the strategic
  // hook before the raw stage list.
  const intel = `${INTEL_MARKER} ${formatIntelNote(i18n, buildIntel(dive, kind).note)}`
  const stages = dive.missions.map((mission, index) => formatStageLine(i18n, index, mission))

  return [heading, intel, ...stages].join('\n')
}

function formatStageLine(i18n: I18n, index: number, mission: DeepDiveMission): string {
  const primary = formatObjectiveEntry(i18n, mission.primaryObjective, formatPrimaryObjective)
  const secondary = formatObjectiveEntry(i18n, mission.secondaryObjective, formatSecondaryObjective)
  const parts = [`${index + 1}. ${primary} + ${secondary}`]

  if (mission.warning != null) parts.push(`${WARNING_MARKER} ${formatWarning(i18n, mission.warning)}`)
  if (mission.anomaly != null) parts.push(`${ANOMALY_MARKER} ${formatAnomaly(i18n, mission.anomaly)}`)

  return parts.join(' · ')
}

// Share objectives read exactly like the on-screen labels (`Morkite x250`,
// `Deep Scan x3`) — object first, count second — only prefixed with the type
// emoji. The formatter is passed in so each slot uses its own contract union.
function formatObjectiveEntry<T extends DeepDivePrimaryObjective | DeepDiveSecondaryObjective>(
  i18n: I18n,
  objective: T,
  format: (i18n: I18n, objective: T) => string,
): string {
  return `${objectiveEmoji[objective.kind]} ${format(i18n, objective)}`
}
