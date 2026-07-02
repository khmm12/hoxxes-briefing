import type { I18n, MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { type SloganPool, selectSlogan } from '../../lib/slogan'

const sloganPool: SloganPool<MessageDescriptor> = [
  // Salutes
  msg`Rock and Stone!`,
  msg`Rock and Stone, Brother!`,
  msg`Rock and Stone to the Bone!`,
  msg`Rock and Stone forever!`,
  msg`For Rock and Stone!`,
  msg`Did I hear a Rock and Stone?`,
  msg`If you Rock and Stone, you're never alone.`,
  msg`If you don't Rock and Stone, you ain't comin' home!`,
  msg`Rock solid!`,
  msg`We are unbreakable!`,
  msg`None can stand before us!`,
  msg`By the Beard!`,
  msg`For Karl!`,
  msg`Karl Would Be Proud!`,
  // Attitude
  msg`Locked and loaded!`,
  msg`I was born ready!`,
  msg`I eat rock for breakfast!`,
  msg`Darkness, here I come!`,
  msg`Fortune and glory!`,
  msg`Long live the Dwarves!`,
  msg`Just show me where to shoot!`,
  msg`Digging's my middle name!`,
  msg`If it ain't drillable, it's probably flammable.`,
  msg`The truth is out there. So's the gold.`,
  msg`Afraid of the dark? No need, you got me!`,
  msg`Let there be light!`,
  msg`Let's play this smart for once, huh?`,
  // Company
  msg`Leave no dwarf behind.`,
  msg`Brotherhood. Danger. Profit.`,
  msg`Danger. Darkness. Dwarves.`,
  msg`Drop Pod will leave with or without you!`,
  msg`Management will not be happy.`,
  msg`Dwarves are assets. Assets are expendable.`,
  msg`100% destructible environments, 0% job security.`,
  msg`Gold! ... I mean, for science!`,
]

export function getSlogan(i18n: I18n, seed: number): string {
  return i18n._(selectSlogan(sloganPool, seed))
}
