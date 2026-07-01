import { generate } from '@hoxxes-briefing/wasm'
import type { Briefing } from '../../application/models/briefing.ts'

export type GeneratedBriefing = Pick<Briefing, 'seed' | 'dives'>

export const generateBriefing = (seed: number): GeneratedBriefing => generate(seed)
