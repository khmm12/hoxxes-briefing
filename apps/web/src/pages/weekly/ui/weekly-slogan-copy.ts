import type { I18n, MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { selectWeeklySlogan, type WeeklySloganPool } from '../model/weekly-slogan'

const weeklySloganPool: WeeklySloganPool<MessageDescriptor> = {
  defaultSafe: [
    msg`Rock and Stone!`,
    msg`For Karl!`,
    msg`Danger. Darkness. Dwarves.`,
    msg`Leave no dwarf behind.`,
    msg`If you Rock and Stone, you're never alone.`,
  ],
  secondary: [msg`Brotherhood. Danger. Profit.`, msg`Locked and loaded!`, msg`Stand together. Hold the line.`],
  rare: [],
}

export function getWeeklySlogan(i18n: I18n, weekId: string): string {
  return i18n._(selectWeeklySlogan(weeklySloganPool, weekId))
}
