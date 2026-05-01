use criterion::{Criterion, criterion_group, criterion_main};
use std::hint::black_box;

use drg_mission_gen_wasm::wasm_generate;

fn criterion_benchmark(c: &mut Criterion) {
    c.bench_function("generate", |b| {
        b.iter(|| black_box(wasm_generate(black_box(1))))
    });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
