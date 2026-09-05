# Generator regression fixtures

These complete normal/elite pairs are shared by the native Rust integration
test and the API test of the committed WASM artifact. Expectations were
transcribed from the community's weekly reports, then compared field by field
with the pinned generator. They are not automatically updated snapshots.

Sources checked on 2026-09-05:

- [2026-09-03 report](https://www.reddit.com/r/DeepRockGalactic/comments/1w69x9v/weekly_deep_dives_thread_3rd_september_2026/):
  Bright Ravine / Pale Bottom. The official
  [GSG event endpoint](https://drg.ghostship.dk/events/deepdive) returned
  `SeedV2: 3322316356`, `ExpirationTime: 2026-09-10T11:00:00Z`.
- [2026-08-27 report](https://www.reddit.com/r/DeepRockGalactic/comments/1vzw64g/weekly_deep_dives_thread_27th_august_2026/):
  Rocky Wilderness / Scarred Pursuit. `32502` is the effective generator seed
  found by enumerating the 17-bit seed space and matching both names; it is
  **not** a recovered historical `SeedV2`. The full reported missions were
  then checked independently of that name search.

Report vocabulary is normalized to the wire contract (`Crystal Scan` becomes
`DeepScan`, `D` becomes `Classic`, `H` becomes `Hiveguard`, `T` becomes `Twins`).
The reports omit fixed primary quantities for Refining and Sabotage; the
fixtures encode their three wells and two power stations as specified in the
[domain reference](../../../docs/domain.md). All other quantities, boss
variants, names, biomes, objective kinds, warnings, and anomalies are present
in the reports. Dreadnought order follows the report notation.

These are externally cross-checked regression anchors, not direct game dumps.
Community reports can contain mistakes; they do not prove every seed or a
future season correct. A mismatch requires investigating the report, generator,
facade and WASM artifact before changing the fixture. Add a new dated fixture
for a season change instead of regenerating expectations from the code under
test. The season verification procedure remains in the
[contract runbook](../../../docs/contract-runbook.md).
