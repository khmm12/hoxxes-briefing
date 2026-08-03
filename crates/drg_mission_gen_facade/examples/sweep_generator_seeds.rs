//! Exhaustively validates generator seeds in a deterministic pseudo-random order.

use std::{
    cell::Cell,
    env, panic,
    sync::atomic::{AtomicBool, AtomicU64, Ordering},
    thread,
    time::{Duration, Instant},
};

use drg_mission_gen_facade::{Seed, deep_dives_from_seed};

const DEFAULT_SEED_COUNT: u64 = 100_000_000;
const DEFAULT_SEED_ORDER_KEY: u32 = 0x9E37_79B9;
const SEED_SPACE_SIZE: u64 = u32::MAX as u64 + 1;
const CANCELLATION_CHECK_INTERVAL: u64 = 1_024;
const PROGRESS_INTERVAL: Duration = Duration::from_secs(10);

static CANCELLED: AtomicBool = AtomicBool::new(false);
static FINISHED: AtomicBool = AtomicBool::new(false);
static PROCESSED: AtomicU64 = AtomicU64::new(0);

thread_local! {
    static CURRENT_SEED: Cell<Option<u32>> = const { Cell::new(None) };
}

fn main() {
    install_panic_context();

    if let Err(error) = sweep() {
        eprintln!("{error}");
        std::process::exit(1);
    }
}

fn sweep() -> Result<(), String> {
    let offset = read_env("SEED_OFFSET", 0)?;
    let count = read_env("SEED_COUNT", DEFAULT_SEED_COUNT)?;
    let order_key = read_env("SEED_ORDER_KEY", u64::from(DEFAULT_SEED_ORDER_KEY))?;
    let workers = read_workers()?;

    if offset >= SEED_SPACE_SIZE {
        return Err(format!(
            "SEED_OFFSET must be at most {}, got {offset}",
            u32::MAX
        ));
    }
    if count == 0 {
        return Err("SEED_COUNT must be a positive integer".to_string());
    }
    if order_key > u64::from(u32::MAX) {
        return Err(format!(
            "SEED_ORDER_KEY must be at most {}, got {order_key}",
            u32::MAX
        ));
    }

    let end = offset
        .checked_add(count)
        .filter(|end| *end <= SEED_SPACE_SIZE)
        .ok_or_else(|| {
            format!(
                "seed position range {offset}..{} exceeds the u32 seed space",
                offset.saturating_add(count)
            )
        })?;

    let workers = workers.min(count.try_into().unwrap_or(usize::MAX));
    let started_at = Instant::now();
    run_workers(offset, count, workers, order_key as u32)?;
    report(offset, end, workers, order_key as u32, started_at.elapsed());
    Ok(())
}

fn run_workers(offset: u64, count: u64, workers: usize, order_key: u32) -> Result<(), String> {
    CANCELLED.store(false, Ordering::Relaxed);
    FINISHED.store(false, Ordering::Relaxed);
    PROCESSED.store(0, Ordering::Relaxed);

    let workers = workers as u64;
    let base_range_size = count / workers;
    let longer_ranges = count % workers;
    let mut next_start = offset;
    let mut handles = Vec::with_capacity(workers as usize);
    let progress_started_at = Instant::now();
    let progress_reporter =
        thread::spawn(move || report_progress_until_finished(count, progress_started_at));
    let progress_thread = progress_reporter.thread().clone();

    for worker in 0..workers {
        let range_size = base_range_size + u64::from(worker < longer_ranges);
        let range_start = next_start;
        let range_end = range_start + range_size;
        next_start = range_end;

        handles.push(thread::spawn(move || {
            sweep_range(range_start, range_end, order_key)
        }));
    }

    let mut first_error = None;

    for handle in handles {
        match handle.join() {
            Ok(Ok(())) => {}
            Ok(Err(error)) => {
                first_error.get_or_insert(error);
            }
            Err(_) => {
                first_error.get_or_insert_with(|| "seed sweep worker panicked".to_string());
            }
        }
    }

    FINISHED.store(true, Ordering::Relaxed);
    progress_thread.unpark();
    progress_reporter
        .join()
        .map_err(|_| "seed sweep progress reporter panicked".to_string())?;

    first_error.map_or(Ok(()), Err)
}

fn sweep_range(start: u64, end: u64, order_key: u32) -> Result<(), String> {
    let mut pending_progress = 0;

    for position in start..end {
        if pending_progress == CANCELLATION_CHECK_INTERVAL {
            PROCESSED.fetch_add(pending_progress, Ordering::Relaxed);
            pending_progress = 0;

            if CANCELLED.load(Ordering::Relaxed) {
                return Ok(());
            }
        }

        let seed = permute_seed(position as u32, order_key);
        CURRENT_SEED.set(Some(seed));

        if let Err(error) = deep_dives_from_seed(Seed::new(seed)) {
            PROCESSED.fetch_add(pending_progress, Ordering::Relaxed);
            CANCELLED.store(true, Ordering::Relaxed);
            return Err(format!("seed {seed} failed conversion: {error}"));
        }

        pending_progress += 1;
    }

    PROCESSED.fetch_add(pending_progress, Ordering::Relaxed);
    CURRENT_SEED.set(None);
    Ok(())
}

fn permute_seed(position: u32, order_key: u32) -> u32 {
    // Every operation is bijective over u32: addition and multiplication wrap,
    // both multipliers are odd, and xor-shifts are invertible. The resulting
    // order is pseudo-random but still visits every seed exactly once.
    let mut seed = position.wrapping_add(order_key);
    seed ^= seed >> 16;
    seed = seed.wrapping_mul(0x7FEB_352D);
    seed ^= seed >> 15;
    seed = seed.wrapping_mul(0x846C_A68B);
    seed ^= seed >> 16;
    seed
}

fn read_env(name: &str, default: u64) -> Result<u64, String> {
    match env::var(name) {
        Ok(value) => value
            .parse()
            .map_err(|_| format!("{name} must be a non-negative integer, got {value:?}")),
        Err(env::VarError::NotPresent) => Ok(default),
        Err(error) => Err(format!("failed to read {name}: {error}")),
    }
}

fn read_workers() -> Result<usize, String> {
    match env::var("SEED_WORKERS") {
        Ok(value) if value.eq_ignore_ascii_case("auto") => Ok(auto_worker_count()),
        Ok(value) => {
            let workers = value.parse::<usize>().map_err(|_| {
                format!("SEED_WORKERS must be AUTO or a positive integer, got {value:?}")
            })?;

            if workers == 0 {
                return Err("SEED_WORKERS must be AUTO or a positive integer".to_string());
            }

            Ok(workers)
        }
        Err(env::VarError::NotPresent) => Ok(auto_worker_count()),
        Err(error) => Err(format!("failed to read SEED_WORKERS: {error}")),
    }
}

fn auto_worker_count() -> usize {
    thread::available_parallelism().map_or(1, usize::from)
}

fn install_panic_context() {
    let default_hook = panic::take_hook();

    panic::set_hook(Box::new(move |info| {
        CURRENT_SEED.with(|seed| {
            if let Some(seed) = seed.get() {
                eprintln!("panic while generating seed {seed}");
            }
        });
        CANCELLED.store(true, Ordering::Relaxed);
        default_hook(info);
    }));
}

fn report_progress_until_finished(total: u64, started_at: Instant) {
    loop {
        thread::park_timeout(PROGRESS_INTERVAL);

        if FINISHED.load(Ordering::Relaxed) {
            return;
        }

        let processed = PROCESSED.load(Ordering::Relaxed);
        let elapsed = started_at.elapsed().as_secs_f64();
        let seeds_per_second = processed as f64 / elapsed;
        let remaining_seconds = (total - processed) as f64 / seeds_per_second;

        eprintln!(
            "progress: {processed}/{total} ({:.1}%), {:.0} seeds/s, ETA {:.1} min",
            processed as f64 / total as f64 * 100.0,
            seeds_per_second,
            remaining_seconds / 60.0
        );
    }
}

fn report(offset: u64, end: u64, workers: usize, order_key: u32, elapsed: Duration) {
    let count = end - offset;
    let seeds_per_second = count as f64 / elapsed.as_secs_f64();
    let full_sweep_hours = SEED_SPACE_SIZE as f64 / seeds_per_second / 3_600.0;

    println!(
        "swept {count} seeds at positions {offset}..{end} with {workers} workers \
         and order key {order_key} in {:.3}s: {:.0} seeds/s",
        elapsed.as_secs_f64(),
        seeds_per_second
    );
    println!("estimated full u32 sweep: {full_sweep_hours:.2} hours");
}
