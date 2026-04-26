import type { I18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { WeeklyRouteIntelNote } from '../model/weekly-route-intel'

export function formatWeeklyRouteIntelNote(i18n: I18n, note: WeeklyRouteIntelNote): string {
  switch (note) {
    case 'blood-sugar':
      return i18n._(msg`Mind the sugar route. A dry stretch kills momentum.`)
    case 'cave-leech-cluster':
      return i18n._(msg`Eyes up, miners. Greed before scanning gets expensive.`)
    case 'clean-elite':
      return i18n._(msg`Clean Elite drop. Buy the round, then bring everyone home.`)
    case 'clean-normal':
      return i18n._(msg`Clean drop. Round at the Abyss Bar, then keep it tight.`)
    case 'duck-and-cover':
      return i18n._(msg`Keep moving between cover. Open ground has teeth today.`)
    case 'duck-and-cover-fixed':
      return i18n._(msg`Advance by cover, not courage. Call angles before holds.`)
    case 'ebonite-outbreak':
      return i18n._(msg`Leave brawling room. Cramped teams run out of options fast.`)
    case 'elite-threat':
      return i18n._(msg`Call big targets early. Hero trades make bad stories.`)
    case 'exploder-infestation':
      return i18n._(msg`Keep holds loose and exits clear. Tight teams make loud mistakes.`)
    case 'favorable-critical-weakness':
      return i18n._(msg`Call weakpoints and burn big targets early.`)
    case 'favorable-mobility':
      return i18n._(msg`Use the speed. Finish spread jobs before swarms stack.`)
    case 'fixed-objective':
      return i18n._(msg`Prep the hold first. Clear lanes before you lock in.`)
    case 'haunted-cave':
      return i18n._(msg`Move like rent is due. Mine fast, regroup faster.`)
    case 'lethal-enemies':
      return i18n._(msg`Respect every bite. Clean revives beat brave trades.`)
    case 'low-oxygen':
      return i18n._(msg`Stay near the cans. Long flanks cost more than time.`)
    case 'low-oxygen-long-route':
      return i18n._(msg`Plan resupply hops early. Long caves punish greedy legs.`)
    case 'mactera-plague':
      return i18n._(msg`Own the ceiling lines. Open space only helps prepared teams.`)
    case 'parasites':
      return i18n._(msg`Clear the cleanup. Small leftovers ruin brave revives.`)
    case 'pit-jaw-colony':
      return i18n._(msg`Watch the floor before you plant. Bad footing breaks good holds.`)
    case 'regenerative-bugs':
      return i18n._(msg`Finish what you start. Half-cleared fights drain the whole dive.`)
    case 'rival-presence':
      return i18n._(msg`Bring armor-cracking focus. Machines do not care about swagger.`)
    case 'scrab-nesting-grounds':
      return i18n._(msg`Keep the floor tidy. Little trouble grows fast under pressure.`)
    case 'shield-disruption':
      return i18n._(msg`Play close and clean. No shields means no lazy mistakes.`)
    case 'swarmageddon':
      return i18n._(msg`Sweep the ankles before the work. Tiny teeth stop big plans.`)
    case 'volatile-guts':
      return i18n._(msg`Mind your spacing. Dead bugs can still ruin the formation.`)
  }
}
