import type { I18n, MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { selectWeeklySlogan, type WeeklySloganPool } from '../model/weekly-slogan'

const weeklySloganPool: WeeklySloganPool<MessageDescriptor> = {
  defaultSafe: [
    msg`Rock and Stone!`,
    msg`For Karl!`,
    msg`Karl Would Be Proud!`,
    msg`Rock and Stone, Brother!`,
    msg`Locked and loaded!`,
    msg`Brotherhood. Danger. Profit.`,
    msg`Danger. Darkness. Dwarves.`,
    msg`Leave no dwarf behind.`,
  ],
  secondary: [msg`If you Rock and Stone, you're never alone.`],
  rare: [
    msg`Darkness, here I come!`,
    msg`I eat rock for breakfast!`,
    msg`Let's play this smart for once, huh?`,
    msg`Just show me where to shoot!`,
  ],
}

export function getWeeklySlogan(i18n: I18n, weekId: string): string {
  return i18n._(selectWeeklySlogan(weeklySloganPool, weekId))
}
