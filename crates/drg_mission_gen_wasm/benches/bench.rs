use criterion::{Criterion, criterion_group, criterion_main};
use std::hint::black_box;

use drg_mission_gen_wasm::generate_payload;

fn criterion_benchmark(c: &mut Criterion) {
    // Bench the pure-Rust generation path; the wasm-bindgen `generate` wrapper
    // adds a JsValue serialization step that panics off-wasm.
    c.bench_function("generate", |b| {
        b.iter(|| black_box(generate_payload(black_box(1))))
    });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
