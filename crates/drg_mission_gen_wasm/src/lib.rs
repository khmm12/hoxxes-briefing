#[macro_use]
mod macros;

mod converters;
mod models;

use drg_mission_gen_facade::{Seed, deep_dives_from_seed};
pub use models::{ConverterError, GeneratedBriefing};
use serde::Serialize;
use wasm_bindgen::prelude::*;

// Compact allocator for the shipped wasm binary; talc's dynamic wasm allocator
// grows the linear memory on demand. Gated to single-threaded wasm — on the host
// (native test builds) the system allocator is used instead.
#[cfg(all(not(target_feature = "atomics"), target_family = "wasm"))]
#[global_allocator]
static ALLOC: talc::wasm::WasmDynamicTalc = talc::wasm::new_wasm_dynamic_allocator();

#[wasm_bindgen(js_name = generate, unchecked_return_type = "GeneratedBriefing")]
pub fn wasm_generate(seed: u32) -> Result<JsValue, ConverterError> {
    let payload = generate_payload(seed)?;
    let serializer = serde_wasm_bindgen::Serializer::new().serialize_missing_as_null(true);

    Ok(payload.serialize(&serializer).unwrap())
}

// Pure-Rust generation path, split out from the wasm-bindgen boundary so it can
// run off-wasm (benches, host tests) without hitting js-sys imports.
pub fn generate_payload(seed: u32) -> Result<GeneratedBriefing, ConverterError> {
    deep_dives_from_seed(Seed::new(seed))
        .map(From::from)
        .map_err(ConverterError::from)
}

#[cfg(test)]
mod tests;
