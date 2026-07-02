# Hoxxes Briefing Product

Hoxxes Briefing is a focused briefing for Deep Rock Galactic players. It
answers one question quickly:

> What are we dealing with this week, and when does it reset?

## Audience

The primary audience is players checking the current Deep Dive and Elite Deep
Dive. Some users only run the normal Deep Dive; others compare both. The normal
Deep Dive must not feel secondary just because Elite is harder.

The app is not a generic dashboard, wiki, marketing site, joke page, archive, or
admin surface.

## The Board

The first screen is the product. It should show:

- current Deep Dive and Elite Deep Dive
- the briefing's start, end, and time remaining
- briefing freshness and availability
- Deep Dive name, biome, and three stages per Deep Dive
- primary objective, secondary objective, warning, and anomaly (mutator) for each stage
- short Deep Dive guidance when the current data supports it

The board should be compact, readable on phones, and easy to scan under pressure.
Timing, mutators, and stage structure are more important than decorative detail.

## States

The app must handle:

- loading
- live data
- cached data
- offline with cached data
- offline with no cached data
- fetch failure
- not found
- app update available

If a readable board is already visible, background refresh must keep it visible.
Only the freshness copy and refresh control should change while the refresh is in
flight.

## Tone

The visual direction is an industrial mission board for Hoxxes IV: compact,
warm, rough, and operational. It should feel themed without becoming noisy or
hard to read.

Avoid:

- generic SaaS dashboard patterns
- table-first layouts
- oversized hero composition
- decorative effects that compete with mission data
- implementation terms in primary UI copy

## Copy And Accessibility

Copy should be short, direct, and lightly themed. Use Deep Dive names, mutators,
timing, and recovery language. Avoid explaining how the interface works.

Interactive controls must have usable touch targets. Status changes should be
announced politely when they affect the visible board. State screens should give
keyboard users a sensible focus target.
