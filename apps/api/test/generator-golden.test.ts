import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { it } from 'node:test'
import { generateBriefing } from '../src/infrastructure/generator/generator-bridge.ts'

// Shared with the native Rust test: exercise the shipped WASM artifact as well
// as the source implementation against externally cross-checked expectations.
for (const [date, seed] of [
  ['2026-08-27', 32502],
  ['2026-09-03', 3322316356],
] as const) {
  it(`reproduces both complete Deep Dives from ${date}`, async () => {
    const expected: unknown = JSON.parse(
      await readFile(new URL(`../../../test/fixtures/briefing/${date}.json`, import.meta.url), 'utf8'),
    )

    assert.deepEqual(generateBriefing(seed), expected)
  })
}
