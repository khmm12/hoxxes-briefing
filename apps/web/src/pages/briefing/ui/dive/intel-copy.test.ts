import { describe, expect, it } from 'vitest'
import type { I18n } from '@lingui/core'
import { createTestI18n } from '~test/render'
import type { IntelNote } from '../../model/intel'
import { formatIntelNote } from './intel-copy'

const i18n: I18n = createTestI18n()

const notes: IntelNote[] = [
  'blood-sugar',
  'cave-leech-cluster',
  'clean-elite',
  'clean-normal',
  'duck-and-cover',
  'duck-and-cover-fixed',
  'ebonite-outbreak',
  'elite-threat',
  'exploder-infestation',
  'favorable-critical-weakness',
  'favorable-mobility',
  'fixed-objective',
  'haunted-cave',
  'lethal-enemies',
  'low-oxygen',
  'low-oxygen-long-route',
  'mactera-plague',
  'parasites',
  'pit-jaw-colony',
  'regenerative-bugs',
  'rival-presence',
  'scrab-nesting-grounds',
  'shield-disruption',
  'swarmageddon',
  'volatile-guts',
]

describe('formatIntelNote', () => {
  it.each(notes)('returns copy for %s', (note) => {
    expect(formatIntelNote(i18n, note)).toBeTruthy()
  })

  it('returns distinct copy per note', () => {
    const texts = notes.map((note) => formatIntelNote(i18n, note))

    expect(new Set(texts).size).toBe(notes.length)
  })
})
