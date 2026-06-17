// Single source of truth for the Hoxxes Briefing brand emblem geometry.
//
// The same dwarf mark renders in two framings: the full-bleed app icon (gold plate +
// dark mark, used for the install icons) and the bare gold logo (transparent, used for
// the in-app brand logo and the iOS splash). `scripts/generate-icons.ts` rasterizes
// these into every PNG; editing the path or palette here and rerunning keeps them in
// sync. Build-only — never imported into the client bundle.

// Path drawn in the 1024×1024 icon coordinate space, shared by every variant.
export const EMBLEM_PATH = `M 406 782 L 512 969 L 579 851 L 579 847 Z
M 746 693 L 690 590 L 542 646 L 507 591 L 295 670 L 284 687 L 336 783 L 398 671 L 456 699 L 430 752 L 518 784 L 578 671 L 635 696 L 614 752 L 700 783 Z
M 139 469 L 211 604 L 315 566 L 263 468 L 311 451 L 393 604 L 496 566 L 444 468 L 491 450 L 572 605 L 678 566 L 625 468 L 672 451 L 755 603 L 844 434 L 716 387 L 567 442 L 536 387 L 388 442 L 352 387 Z
M 760 379 L 709 298 L 634 278 L 574 279 L 511 329 L 453 279 L 374 279 L 307 309 L 255 397 L 369 353 L 400 407 L 547 347 L 578 407 L 704 356 Z
M 513 169 L 507 171 L 480 187 L 477 190 L 470 226 L 465 245 L 465 250 L 512 293 L 544 264 L 559 248 L 551 216 L 548 197 L 545 188 Z
M 703 157 L 741 236 L 700 238 L 755 337 L 859 379 L 750 181 Z
M 318 156 L 272 180 L 163 379 L 267 336 L 321 237 L 281 235 Z
M 877 100 L 844 101 L 781 188 L 838 293 L 846 304 L 886 267 L 839 189 Z
M 145 100 L 182 190 L 138 261 L 136 267 L 177 304 L 241 188 L 176 100 Z
M 320 212 L 450 213 L 458 175 L 513 144 L 564 173 L 574 214 L 705 214 L 670 108 L 577 53 L 450 51 L 355 107 Z`

// Gold gradient shared by every variant (the bare logo and the plate both use it).
export const GOLD_GRADIENT = `    <linearGradient id="gold" x1="0.18" y1="0.12" x2="0.82" y2="0.88">
      <stop offset="0%" stop-color="#f0ce61"/>
      <stop offset="52%" stop-color="#dfb847"/>
      <stop offset="100%" stop-color="#c9971d"/>
    </linearGradient>`

// Radial sheen layered over the gold plate; only the full-bleed icons use it.
export const GOLD_SHADE_GRADIENT = `    <radialGradient id="goldShade" cx="0.32" cy="0.18" r="0.95">
      <stop offset="0%" stop-color="#ffe9a6" stop-opacity="0.45"/>
      <stop offset="55%" stop-color="#ffe9a6" stop-opacity="0"/>
      <stop offset="100%" stop-color="#7b5600" stop-opacity="0.28"/>
    </radialGradient>`

// Dark fill for the mark when it sits on the gold plate.
export const MARK_ON_PLATE_FILL = '#231d0a'

// Tight viewBox cropping the mark for the bare gold logo (UI + splash source).
export const EMBLEM_VIEWBOX_TIGHT = '120 40 792 940'
export const EMBLEM_TIGHT_WIDTH = 792
export const EMBLEM_TIGHT_HEIGHT = 940

// Full-bleed square icon: gold plate + radial sheen, dark mark scaled to `scale`.
// Feeds the install icons (app icon at 0.86, maskable at 0.72 for the safe circle).
export function renderFullBleedIcon(scale: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
${GOLD_GRADIENT}
${GOLD_SHADE_GRADIENT}
  </defs>

  <rect width="1024" height="1024" fill="url(#gold)"/>
  <rect width="1024" height="1024" fill="url(#goldShade)"/>

  <g transform="translate(512 512) scale(${scale}) translate(-512 -512)">
    <path d="${EMBLEM_PATH}" fill="${MARK_ON_PLATE_FILL}" fill-rule="evenodd"/>
  </g>
</svg>
`
}

// Bare gold mark on a transparent, tightly cropped canvas (in-app brand logo + iOS splash).
export function renderBareLogo(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${EMBLEM_VIEWBOX_TIGHT}" width="${EMBLEM_TIGHT_WIDTH}" height="${EMBLEM_TIGHT_HEIGHT}">
  <title>Hoxxes Briefing</title>
  <defs>
${GOLD_GRADIENT}
  </defs>

  <path d="${EMBLEM_PATH}" fill="url(#gold)" fill-rule="evenodd"/>
</svg>
`
}

// Rounded gold tile for the browser-tab favicon. Distinct from the full-bleed install icon:
// browsers don't mask tab icons, so it carries its own corners (`rx`), and the mark is inset
// for legibility down to 16px. Feeds both the live favicon.svg and the rasterized favicon.ico.
const FAVICON_SIZE = 120
const FAVICON_RADIUS = 26
const FAVICON_INSET = { x: 12, y: 10, width: 96, height: 100 }

export function renderFaviconTile(): string {
  const { x, y, width, height } = FAVICON_INSET
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FAVICON_SIZE} ${FAVICON_SIZE}" width="${FAVICON_SIZE}" height="${FAVICON_SIZE}">
  <title>Hoxxes Briefing</title>
  <defs>
${GOLD_GRADIENT}
  </defs>
  <rect width="${FAVICON_SIZE}" height="${FAVICON_SIZE}" rx="${FAVICON_RADIUS}" fill="url(#gold)"/>
  <svg aria-hidden="true" x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${EMBLEM_VIEWBOX_TIGHT}" preserveAspectRatio="xMidYMid meet">
    <path d="${EMBLEM_PATH}" fill="${MARK_ON_PLATE_FILL}" fill-rule="evenodd"/>
  </svg>
</svg>
`
}
