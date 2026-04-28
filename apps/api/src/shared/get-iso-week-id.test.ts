import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getIsoWeekId } from './get-iso-week-id.ts'

type TestCase = { name: string; ts: string; expected: string }

const testCases: ReadonlyArray<TestCase> = [
  {
    name: 'maps a regular Deep Dive Thursday to its ISO week',
    ts: '2026-04-23T11:00:00.000Z',
    expected: '2026-W17',
  },
  {
    name: 'maps New Year day to the previous ISO year when the week belongs there',
    ts: '2021-01-01T11:00:00.000Z',
    expected: '2020-W53',
  },
  {
    name: 'maps late December to the next ISO year when the week belongs there',
    ts: '2014-12-29T11:00:00.000Z',
    expected: '2015-W01',
  },
  {
    name: 'keeps week 53 for an ISO year that has one',
    ts: '2020-12-31T11:00:00.000Z',
    expected: '2020-W53',
  },
  {
    name: 'maps the first Monday of an ISO year to week one',
    ts: '2024-01-01T11:00:00.000Z',
    expected: '2024-W01',
  },
  {
    name: 'maps the Sunday at the end of week one to week one',
    ts: '2024-01-07T11:00:00.000Z',
    expected: '2024-W01',
  },
  {
    name: 'uses the UTC calendar date instead of the runtime timezone date',
    ts: '2014-12-28T23:30:00.000Z',
    expected: '2014-W52',
  },
]

describe('getIsoWeekId', () => {
  for (const tc of testCases) {
    it(tc.name, () => {
      assert.equal(getIsoWeekId(tc.ts), tc.expected)
    })
  }
})
