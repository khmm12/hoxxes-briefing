#[macro_use]
mod macros;

mod converters;
mod models;

use drg_mission_gen_facade::{Seed, deep_dives_from_seed};
pub use models::{ConverterError, GeneratedBriefing};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(js_name = generate, unchecked_return_type = "GeneratedBriefing")]
pub fn wasm_generate(seed: u32) -> Result<JsValue, ConverterError> {
    let payload = generate_payload(seed)?;
    let serializer = serde_wasm_bindgen::Serializer::new().serialize_missing_as_null(true);

    Ok(payload.serialize(&serializer).unwrap())
}

fn generate_payload(seed: u32) -> Result<GeneratedBriefing, ConverterError> {
    deep_dives_from_seed(Seed::new(seed))
        .map(From::from)
        .map_err(ConverterError::from)
}

#[cfg(test)]
mod tests;
