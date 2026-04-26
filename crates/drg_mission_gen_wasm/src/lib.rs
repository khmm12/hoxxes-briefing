mod converters;
mod models;

#[macro_use]
mod macros;

pub mod wasm {
    pub use crate::models::{ConverterError, DeepDiveResult, Seed};
}

use drg_mission_gen_facade::deep_dives_from_seed;
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(js_name = generate)]
pub fn wasm_generate(seed: wasm::Seed) -> Result<wasm::DeepDiveResult, wasm::ConverterError> {
    deep_dives_from_seed(seed.into())
        .map(From::from)
        .map_err(From::from)
}
