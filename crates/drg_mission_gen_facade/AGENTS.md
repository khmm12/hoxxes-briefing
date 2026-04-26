# AGENTS

This crate is the stable Rust facade over `drg_mission_gen_core`. It converts
upstream Deep Dive generator data into local models for the workspace.

## Invariants

- `MISSION_COUNT` is exactly `3`.
- Conversion errors should be explicit and typed.
- Unexpected upstream enum or objective variants must fail loudly through
  `ConverterError`.
- Facade model changes must be reviewed for WASM and API consumer impact.

## Work Rules

- Keep this crate free of web-specific concerns.
- Add focused tests around converter invariants and supported objective mapping.
- Do not leak upstream types into downstream layers.
- Do not silently fallback for unsupported upstream variants.
