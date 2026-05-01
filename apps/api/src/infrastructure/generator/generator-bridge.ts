import { generate } from '@hoxxes-briefing/wasm'
import type { CurrentDeepDives } from '../../application/models/current-deep-dives.ts'

export type GeneratedDeepDives = Pick<CurrentDeepDives, 'seed' | 'dives'>

export const generateWeeklyDives = (seed: number): GeneratedDeepDives => generate(seed)
