---
version: alpha
name: Hoxxes Briefing
description: >-
  Industrial mission board for Hoxxes IV — Deep Rock Galactic Deep
  Dives. Compact, warm, rough, operational.
colors:
  # Primitives — carry values, referenced only by semantic tokens.
  neutral-950: "#090909"
  neutral-900: "#0e0e0c"
  neutral-850: "#12120f"
  neutral-800: "#171713"
  neutral-700: "#22211c"
  parchment-100: "#f5ecd4"
  parchment-300: "#c6bda7"
  parchment-500: "#8d867a"
  gold-300: "#f0c75f"
  gold-400: "#e2b948"
  gold-500: "#c9a140"
  green-400: "#87b97b"
  orange-400: "#e8825c"
  blue-300: "#b0c0c8"
  # Semantic roles — the only tokens components may reference.
  bg: "{colors.neutral-950}"
  surface: "{colors.neutral-850}"
  surface-raised: "{colors.neutral-800}"
  surface-sunken: "{colors.neutral-900}"
  surface-muted: "#f5ecd40a"
  text-primary: "{colors.parchment-100}"
  text-secondary: "{colors.parchment-300}"
  text-muted: "{colors.parchment-500}"
  text-inverse: "{colors.neutral-950}"
  border-subtle: "#f5ecd41a"
  border-strong: "#f5ecd433"
  focus-ring: "#f5ecd466"
  selection: "#e2b94866"
  primary: "{colors.gold-400}"
  primary-hover: "{colors.gold-300}"
  primary-active: "{colors.gold-500}"
  primary-surface: "#e2b9481f"
  primary-surface-hover: "#e2b9482e"
  primary-border: "#e2b9483d"
  success: "{colors.green-400}"
  success-surface: "#87b97b1f"
  success-border: "#87b97b3d"
  warning: "{colors.gold-300}"
  warning-surface: "#f0c75f1f"
  warning-border: "#f0c75f3d"
  danger: "{colors.orange-400}"
  danger-surface: "#e8825c1f"
  danger-border: "#e8825c3d"
  info: "{colors.blue-300}"
  info-surface: "#b0c0c81f"
  info-border: "#b0c0c83d"
  # Biome accents — domain constants; hue anchors sampled from the planet
  # map (the 69/d3 channel language), hues re-spread for separability.
  # Used directly by biome glyphs (the one sanctioned primitive-level use).
  biome-crystalline-caverns: "#b069d3"
  biome-fungus-bogs: "#a8d369"
  biome-magma-core: "#d36969"
  biome-radioactive-exclusion-zone: "#70d369"
  biome-dense-biozone: "#69d3c5"
  biome-sandblasted-corridors: "#d3c569"
  biome-salt-pits: "#d369a2"
  biome-glacial-strata: "#6994d3"
  biome-azure-weald: "#7a69d3"
  biome-hollow-bough: "#d2906a"
  biome-ossuary-depths: "#d3a269"
typography:
  display-xl:
    fontFamily: Rajdhani
    fontSize: 24px
    fontWeight: 700
    letterSpacing: 0.04em
    lineHeight: 1.2
  display-lg:
    fontFamily: Rajdhani
    fontSize: 20px
    fontWeight: 700
    letterSpacing: 0.04em
    lineHeight: 1.2
  headline:
    fontFamily: Rajdhani
    fontSize: 24px
    fontWeight: 700
    letterSpacing: 0.04em
    lineHeight: 1.2
  control:
    fontFamily: Rajdhani
    fontSize: 16px
    fontWeight: 700
    letterSpacing: 0.04em
    lineHeight: 1.2
  action:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.2
  eyebrow:
    fontFamily: Rajdhani
    fontSize: 14px
    fontWeight: 700
    letterSpacing: 0.04em
    lineHeight: 1.333
  metric:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  metric-sm:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: 500
    letterSpacing: 0.02em
    lineHeight: 1.4
  label-strong:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  "0.5": 2
  "1": 4
  "1.5": 6
  "2": 8
  "2.5": 10
  "3": 12
  "4": 16
  "5": 20
  "6": 24
  "7": 28
  "8": 32
  "10": 40
  "11": 44
  "12": 48
  "16": 64
breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px
elevation:
  low: "0 2px 8px rgba(0, 0, 0, 0.18)"
  medium: "0 8px 24px rgba(0, 0, 0, 0.24)"
  high: "0 16px 40px rgba(0, 0, 0, 0.28)"
zIndex:
  base: 0
  raised: 1
  sticky: 100
  overlay: 200
opacity:
  disabled: 0.56
durations:
  "100": 100ms
  "150": 150ms
  "200": 200ms
  "300": 300ms
  "500": 500ms
  "900": 900ms
easings:
  standard: "cubic-bezier(0.2, 0, 0, 1)"
  decelerate: "cubic-bezier(0, 0, 0, 1)"
  accelerate: "cubic-bezier(0.3, 0, 1, 1)"
  linear: linear
motion:
  press:
    duration: "{durations.150}"
    easing: "{easings.standard}"
  fade:
    duration: "{durations.200}"
    easing: "{easings.standard}"
  enter:
    duration: "{durations.300}"
    easing: "{easings.decelerate}"
  exit:
    duration: "{durations.200}"
    easing: "{easings.accelerate}"
  feedback:
    duration: "{durations.900}"
    easing: "{easings.standard}"
  spin:
    duration: "{durations.900}"
    easing: "{easings.linear}"
components:
  button:
    height: 48px
    rounded: "{rounded.full}"
    padding: 0 20px
    backgroundColor: "{colors.primary-surface}"
    textColor: "{colors.text-primary}"
  icon-button:
    size: 32px
    rounded: "{rounded.md}"
    textColor: "{colors.text-secondary}"
  chip:
    height: 28px
    rounded: "{rounded.full}"
    padding: 0 10px
    typography: "{typography.label}"
    textColor: "{colors.text-secondary}"
  dive-tab:
    height: 44px
    rounded: "{rounded.md}"
    typography: "{typography.control}"
  stage-card:
    rounded: "{rounded.md}"
    padding: 12px 16px
    backgroundColor: "{colors.surface-sunken}"
  slab:
    rounded: "{rounded.lg}"
    padding: 16px
    backgroundColor: "{colors.surface-raised}"
  tooltip:
    rounded: "{rounded.md}"
    padding: 8px 12px
    backgroundColor: "{colors.surface-raised}"
    typography: "{typography.label}"
    width: 288px
  status-slot:
    size: 24px
---

# Hoxxes Briefing — Design System

Source of truth for the product's visual language. The canonical artifact is
[`hoxxes-briefing.pen`](./hoxxes-briefing.pen) (Pencil); this document is its
text companion in the [DESIGN.md](https://github.com/google-labs-code/design.md)
format: front-matter tokens are normative values, the prose explains intent
and application. The implementation (`panda.config.ts` and the `shared/ui`
kit) realizes these tokens directly (plus inert plumbing — `spacing.0`,
`colors.transparent` and friends — that carries no design decision); a value
disagreement between the mockups, this document, and the code is a defect —
reconcile them in the same change, none wins by default.

The `.pen` file is organized top-down: **Foundations** (colors, typography,
icons, metrics) → **Components** (with every distinguishable state as a
variant) → **Screens** (canonical mobile/desktop compositions). All component
fills, strokes, and text colors reference Pencil variables — never raw hex.

## Overview

Product and UX intent — audience, briefing contents, tone, the avoid-list —
lives in [docs/product.md](../docs/product.md). This document fixes the
visual language that delivers it: themed but quiet, with timing, mutators,
and stage structure outranking decorative detail; every data surface has an
explicit loading / cached / offline / error / expired treatment, and a
visible board never disappears during refresh.

Domain terminology: *anomaly* is the domain term for the beneficial/neutral
modifier class; *mutator* is its name in code (`DeepDiveMutator`) and in UI
copy (the stage-card label). Both refer to the same concept — see
`docs/domain.md` (“Anomalies (Mutators)”).

## Colors

Two-level architecture (shadcn/tailwind style): **primitives** carry values,
**semantic roles** carry meaning. Components reference semantic roles only;
primitives are referenced only by semantic tokens (exception: biome accents,
which are domain constants used directly by biome glyphs). The full token set
lives in the front matter above.

Status triads are uniform: base color for text/icons, **12%** alpha surface,
**24%** alpha border (`primary`, `success`, `warning`, `danger`, `info`).
Border alphas outside the triads: `border-subtle` 10%, `border-strong` 20%,
`focus-ring` 40% (the minimum that clears the 3:1 focus-indicator contrast
requirement over `bg`), `surface-muted` 4%.

Native browser surfaces are themed too: text selection uses `selection`
(primary at 40% behind unchanged text); scrollbars are thin with a
`border-strong` thumb on a transparent track — default browser chrome looks
alien on the dark theme.

## Typography

Two families: **Rajdhani** (display) and **IBM Plex Sans** (body). Every text
in the product uses one of the 13 front-matter roles — no ad-hoc font sizes,
weights, or line heights.

| Role | Case | Used for |
|---|---|---|
| `display-xl` | uppercase | dive names, brand title (desktop) |
| `display-lg` | uppercase | brand title (mobile) |
| `headline` | sentence | state-screen titles |
| `control` | uppercase | dive switch tabs |
| `action` | — | button labels |
| `eyebrow` | uppercase | eyebrows, stage index |
| `metric` | — | primary objective values |
| `metric-sm` | — | secondary objective values, timing strip (desktop) |
| `body-md` | — | intel notes, state bodies |
| `body-sm` | — | secondary copy, footer, slogans |
| `label` | — | objective/mutator labels, chips, biome line |
| `label-strong` | — | timing strip (mobile), chip accents, freshness notes |
| `caption` | — | fine print |

Notes:
- A role owns exactly one casing. Uppercase is applied via `text-transform`,
  never typed in copy. `headline` is the single sentence-case display role —
  display-* and headline may share sizes but never mix cases.
- The role is named `metric` (not `value`): Panda CSS reserves the key
  `value` as its token-leaf marker, so a token group cannot carry that name.
- Buttons use the `action` role (IBM Plex Sans 16/500), not the display
  family.

## Layout

- **Spacing** — the leading tokens of the Tailwind scale, on Tailwind keys
  (front matter `spacing`): `0.5` = 2 through `16` = 64. No values outside
  the scale.
- **Breakpoints** — Tailwind-standard: `sm 640`, `md 768`, `lg 1024`,
  `xl 1280`, `2xl 1536`. Only these tokens — no custom media queries. The
  board switches from the mobile deck to the two-slab desktop layout at `md`.
- **Controls** — heights 48 (buttons), 44 (dive tabs), 32 (icon button;
  visual size — the touch target stays ≥ 44).
- **Icon slots** — glyphs render only at 12 (button busy spinner), 14
  (status-slot offline), 16 (chips, icon button, button lead icon, biome
  line), 20 (secondary objectives), 24 (primary objectives), 64
  (state-screen indicators). No sizes in between.
- **Z-index** — three page layers: base content (0), sticky chrome (100 —
  the pinned dive switch), overlay (200 — tooltips, PWA dock); plus `raised`
  (1) for a local nudge above sibling content inside an isolated stacking
  context — not a page layer.
- **Canonical viewports** — mobile 390, desktop 1440 with a 1280 content
  column. Mobile page gutter: 12 (the slab carries its own 16 inside,
  so the effective text inset stays comfortable while the gutter never
  drops below the slab corner radius).
- **State screens** — centered column, max-width 448.

## Elevation & Depth

All shadows are pure black; values live in the front-matter `elevation`
scale:

| Level | Used for |
|---|---|
| `low` | small floating elements |
| `medium` | slabs, panels |
| `high` | tooltips, overlays |

Surface steps (`surface-sunken` < `surface` < `surface-raised`) are a
supporting cue only — adjacent steps sit at ~1.03–1.11:1, a subconscious
undertone. The primary depth signal is shadow + border.

## Shapes

- `rounded.sm` 4 — chips inner detail, small controls.
- `rounded.md` 8 — stage cards, tooltips, icon buttons, dive tabs.
- `rounded.lg` 12 — slabs, PWA dock.
- `rounded.full` — buttons, pills, status dots.

## Iconography

Mission glyphs (objectives, warnings, anomalies) are **vector traces of the
in-game pictograms** (`dive-glyphs.tsx`); biome glyphs and the UI set
are original artwork. The whole UI set is solid pictograms with knocked-out
detail, in the same chunky language as the traces: warning-generic and
mutator-generic are traced from the in-game placeholder icons (triangle sign
with an exclamation, downward shield with a gear); alert is an octagon sign
with an exclamation — same family, deliberately distinct from
warning-generic; refresh and offline derive from Material rounded-filled
forms; briefing-unavailable, not-found, spinner and the objective markers are
original in the same style. The `.pen` file carries all of them as reusable
`glyph/*` path components, and the component/screen mockups instantiate those
same components — what you see in the mockups is the production iconography:

- **UI** (10): refresh (`text-secondary`), spinner (`primary`, animated by
  rotation at runtime), alert (`danger`), briefing-unavailable (`primary`; a
  crossed-out panel — the briefing could not be loaded; there is no
  “empty briefing” state, a deep dive exists every week), offline (`info`;
  rendered `text-muted` in the status slot’s dimmed context), not-found
  (`info`), warning-generic (`danger`), mutator-generic (`primary-hover`),
  objective-primary ring (`primary`), objective-secondary ring (`info`) —
  no stroke icons, fills only.
- **Mission objectives** (11) — tinted `primary` when primary, `info` when
  secondary. One glyph covers `HeavyExtraction` (primary) and
  `HeavyExcavation` (secondary): the same mission type pending an upstream
  rename (`// TODO: NAMING` in `models.rs`) — map both to
  `glyph/heavy-extraction`.
- **Warnings** (16) — tinted `danger`. Matches `DeepDiveWarning` in code
  name-for-name.
- **Anomalies / mutators** (5) — tinted `primary-hover`. Matches
  `DeepDiveMutator` name-for-name (includes `volatile-guts`).
- **Biomes** (11) — original artwork, tinted with their `biome-*` accent.

Every glyph lives on a **single 24×24 grid** (one viewBox in SVG; no per-size
redraws — detail weight is fixed in grid units and scales with render size).
Render size follows the slot: 14 (status-slot offline), 16 (chips, icon
button, button lead icon), 20 (secondary objectives), 24 (primary
objectives), 64 (state-screen indicators) — the glyph reads slightly larger
than its text. The `ALT — *` sections in the
`.pen` file keep icon-library stand-ins picked during exploration; they are
reference-only and must not be used in mockups.

## Components

Each component lives in the `.pen` file with every distinguishable state as a
labeled variant.

- **Spinner** — a glyph like any other (`glyph/spinner`): a 280° arc ring on
  the same 24×24 grid with the same optical inset, `primary` by default; the
  runtime animates it by rotation. Busy states render it at regular icon
  slot sizes — 12 inside buttons, 16 in the status slot and the refresh icon
  button, 64 on state screens. No bespoke spinners.
- **Button** — tones `primary | secondary | ghost | danger` × states
  `default | hover | pressed | disabled | busy` (pressed per Interaction
  states, not mocked); single 48 height; optional leading icon; busy shows
  the inline spinner (12 px, label-colored). Pill shape, 1 px border,
  `action` text.
- **Icon button (refresh)** — 32 px, `rounded.md`, ghost, 16 px glyph; states:
  default (bare — no border at rest), hover (subtle border + sunken surface),
  busy (the glyph is replaced by the spinner), flash-success, flash-danger
  (borderless tinted surface + glyph, `motion.feedback`; while a flash is
  held, the hover border takes the outcome tone instead of `border-subtle`),
  disabled.
- **Rundown chip** — pill, `label` text; kinds: `warning` (danger border +
  warning glyph), `mutator` (primary border + anomaly glyph), `quiet`
  (subtle border), `overflow` (“+N more”, strong border, primary-hover text).
- **Eyebrow** — `eyebrow` role; tones `primary | danger | info`.
- **Status slot** — fixed 24 px box: success dot (live), danger dot
  (expired), offline glyph (14 px, dimmed to `text-muted`), spinner (16 px,
  refreshing); never shifts layout.
- **Dive switch** (mobile) — two `control` tabs, 44 px, `rounded.md`; active
  normal = primary surface/border, active elite = danger surface/border,
  inactive = transparent + subtle border. Scrolled (sticky) state: the bar
  pins to the top with an opaque `bg` backdrop and tabs shrink to 32 px
  (type size unchanged).
- **Stage block** — `rounded.md`, sunken surface, subtle border (danger on
  elite); stage index eyebrow; primary (24 px glyph + `metric`) and secondary
  (20 px glyph + `metric-sm`) objective lines; mutator stack under a divider:
  warning card (danger surface/border), anomaly card (primary surface/border),
  or the quiet note.
- **Slab** — `rounded.lg`, raised surface (sunken + danger border on
  elite), `elevation.medium`, radial primary wash from the top-right corner
  (primary-surface / danger-surface); padding steps 16 → 20 (`md`) → 24
  (`lg`): at `md` the two-up board makes each slab roughly phone-width, so
  the full desktop inset only lands at `lg`; header (kind eyebrow — desktop only,
  the mobile dive switch already names the dive — dive name, biome line with
  16 px tinted glyph + `label`, “Last known briefing” freshness note (expired
  briefings only — a cached briefing within a live week is simply valid),
  intel note), rundown chips, three stage blocks.
- **Command rail** — page chrome, not a card: brand block (logo, title,
  slogan), timing strip (`Jun 1 – 8 · 14:00 · 5d 21h`, gold countdown; danger
  “already ended” when expired), status slot, refresh icon button; closed by
  a full-width strong divider. Variants: live, expired, offline (offline
  glyph in the status slot, refresh dimmed), refreshing (spinner replaces the
  refresh glyph).
- **State screen** — centered column (max 448): eyebrow, 64 px indicator
  (glyph or spinner), `headline` title, body, optional second paragraph,
  optional full-width action. Variants: loading, loading-offline,
  error-network, error-api, error-offline (no cache), not-found, crash.
- **Tooltip** — `rounded.md`, raised surface, subtle border, `elevation.high`,
  max-width 288, `label` text.
- **PWA notice** — bottom dock card: `rounded.lg`, subtle border, info
  eyebrow, title/body, secondary action.
- **Confidence notice** — advisory strip between the rail and the deck when
  the briefing is unverified (ADR 0002 `confidence` flag): `rounded.md`,
  info surface + border triad, 20 px alert glyph in `info`, info eyebrow
  (`UNVERIFIED BRIEFING`) over a `body-sm` `text-secondary` line.
  Non-blocking — the board below stays fully live.
- **Footer** — board sign-off, flat on the page background (no card chrome),
  centered: an uppercase gold display salute (`ROCK AND STONE!`) flanked by
  thin angled gold hazard-stripe bands that extend full-bleed to the screen
  edge on mobile (mirroring the header divider treatment), above a single
  `body-sm` `text-muted` signoff (`Made with love by khmm12 ❤️ · Source on
  GitHub`); the GitHub link reveals an underline + `text-secondary` on hover.
  Spaced from the cards by `spacing.6` (24 px) on mobile and `spacing.8`
  (32 px) on desktop — visually separated from the board, not just padded.

## Interaction states

Uniform across every interactive element:

- **Hover** — role-specific surface/border step (`primary-hover`,
  `primary-surface-hover`, underline reveal on footer links), transitioned
  via `motion.press`.
- **Pressed** (`:active`) — reuses the hover treatment (touch has no hover;
  `:active` is its stand-in there); gold elements, which have a third accent
  step, push to `primary-active`. Applied instantly on press-down, released
  via `motion.press`. Transient — spec’d here, not mocked. The mobile dive
  switch tabs say “active” for *selected* — a different axis, not this state.
- **Focus** — `focus-visible` only: 2 px solid `focus-ring` outline,
  2 px offset, no layout shift. Never remove it, never style `:focus` alone.
- **Disabled** — `opacity.disabled` (56%) on the whole control, interaction
  off; colors do not change, so the dim reads as state, not a new palette.
- **Busy** — the control keeps its size; its glyph is replaced by the
  spinner (12/16/64 by slot). Busy implies disabled for input, but not
  visually: hover styling stays live — a working control must not jump
  under the cursor between press and settle.

## Motion

Pencil mockups are static; the motion tokens live in the front matter
(`durations`, `easings`, `motion`) and this section explains their
application. Numeric primitives (Tailwind-compatible), semantic roles on
top — the same two-level architecture as color.

Easings are Material 3 curves (`ease` was too soft for control feedback):
`standard` for within-screen state changes, `decelerate` for entrances
(start fast, settle), `accelerate` for exits (slow out, leave fast),
`linear` for continuous rotation only.

Semantic roles:

| Role | Used for |
|---|---|
| `motion.press` | interactive color/border/transform on buttons, links, tabs |
| `motion.fade` | opacity-only swaps (glyph ↔ spinner, tooltip) |
| `motion.enter` | entrances: `enterUp` (fade + 1.5 rem rise), board appearing |
| `motion.exit` | dismissals (PWA dock, tooltip out) |
| `motion.feedback` | flash-success / flash-danger: hold the outcome color for 60%, then release to resting style |
| `motion.spin` | spinner revolution, infinite |

Behaviors and rules:

- **delayedFadeIn** — loading fallbacks stay invisible for a `duration-200`
  delay, then fade in via `motion.fade`; cached data that lands quickly never
  paints a fallback.
- **Dimming** — disabled/inactive elements dim to **56% opacity**
  (`opacity.disabled`); one constant, not per-component values. Reached via
  `motion.press`.
- **Reduced motion** — `prefers-reduced-motion` replaces movement
  (`enterUp` rise, transforms) with plain opacity fades; the spinner keeps
  rotating (it is status, not decoration); flashes keep color but skip
  nothing — they are already static holds.
- Exactly one animation per outcome: busy = spinner replaces the glyph
  (never a pulse), refresh outcome = flash on the button, board updates
  ride layout, not attention-grabbing motion.

## Screens

Canonical compositions assembled from the components above:

- Desktop 1440: board live, board expired, board unverified (live board +
  confidence notice), loading.
- Mobile 390: board live, board scrolled (shrunk sticky dive switch),
  board offline (cached), error (network), not found,
  board + app-update dock.

Every other product state is derivable from a canonical screen plus the
documented component variants; the briefing itself never changes mid-week:

- board-refreshing = live board + the rail `refreshing` variant;
- board-refresh-failed = live board + danger flash on the refresh button;
- board-from-cache = the live board as-is — a cached briefing within a live
  week is simply valid; only the status tooltip mentions the source. The
  “Last known briefing” freshness note appears on expired briefings alone.

## Copy pools and micro-states

Mockups show one sample from each text pool; the pools themselves live in
code and are not enumerated on the canvas:

- **Status tooltip** (hover/focus on the status slot) — 8 messages keyed by
  expired × refreshing × refresh-failed × offline × cache: “Current briefing
  loaded.”, “Refreshing current briefing now.”, “Saved briefing loaded.”, “Saved
  briefing loaded. Refreshing now.”, “Saved briefing loaded. You're offline for
  now.”, “Last known briefing only. This cycle already ended.”, “Last known
  briefing still shown. Refreshing now.”, “Last known briefing still shown.
  Refresh failed.” (`RefreshPanel`).
- **Overflow chip** toggles to “Show less” while the rundown is expanded
  (`DiveSlab`).
- **Countdown** shows “coming soon” after the cycle expires, until the new
  briefing lands (`TimingStrip`).
- **Slogans** — pool of 13 (`slogan-copy`); **intel notes** — pool of
  25 (`intel-copy`).

## Overflow & localization

Copy goes through Lingui (today a single `en` catalog); the layout must not
bake in the length of any particular string. Rules:

- Long content wraps; nothing truncates silently. The only overflow
  affordance is explicit: the rundown “+N more” chip.
- Controls size to their content with the padding from the component specs —
  never a fixed text width. The tooltip’s 288 is a max-width.
- Countdown and timing digits render with tabular numerals (`metric` /
  `metric-sm` contexts) so ticking does not jitter the layout.
- Uppercase comes from the roles via `text-transform`; never pre-uppercase
  strings in the catalog.

## Do's and Don'ts

- **Do** reference semantic color roles from components; primitives are for
  tokens only. Biome accents are the single sanctioned exception.
- **Do** keep status tinting on the triad: base / 12% surface / 24% border.
  Exception: the icon-button flash drops the border — it is transient
  feedback, not a static surface; the border there belongs to hover alone.
- **Do** render every glyph from its single 24×24 viewBox at the slot size
  (14/16/20/24/64). **Don't** redraw icons per size.
- **Do** replace a busy control's glyph with the Spinner primitive (12/16/64).
  **Don't** invent bespoke spinners, pulses, or ellipsis loaders.
- **Don't** introduce font sizes or weights outside the 13 typography roles;
  uppercase comes from display roles via `text-transform`, never typed copy.
- **Don't** use custom media queries — only the breakpoint tokens.
- **Don't** let a visible board disappear or reflow during refresh; feedback
  rides the status slot, the refresh button flash, and the freshness note.
- **Don't** put implementation terms (cache, fetch, API) in primary copy.
- **Don't** add decorative effects that compete with mission data; elevation
  and the slab wash are the ceiling.
