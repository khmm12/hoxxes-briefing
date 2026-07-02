import type { I18n, MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { type SloganPool, selectSlogan } from '../lib/slogan'

const sloganPool: SloganPool<MessageDescriptor> = [
  msg`Rock and Stone!`,
  msg`For Karl!`,
  msg`Karl Would Be Proud!`,
  msg`Rock and Stone, Brother!`,
  msg`Locked and loaded!`,
  msg`Brotherhood. Danger. Profit.`,
  msg`Danger. Darkness. Dwarves.`,
  msg`Leave no dwarf behind.`,
  msg`If you Rock and Stone, you're never alone.`,
  msg`Darkness, here I come!`,
  msg`I eat rock for breakfast!`,
  msg`Let's play this smart for once, huh?`,
  msg`Just show me where to shoot!`,
]

export function getSlogan(i18n: I18n, seed: number): string {
  return i18n._(selectSlogan(sloganPool, seed))
}
