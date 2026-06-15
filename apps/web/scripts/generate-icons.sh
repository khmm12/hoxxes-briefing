#!/bin/sh

set -eu

# Regenerate favicon and PWA install icons from their SVG sources, then losslessly
# optimize the output.
#
# pwa-assets-generator writes each asset next to its source image and has no
# output-dir flag. The app-icon and maskable sources live in assets/icons/ (outside
# public/, so they never ship), so their generated PNGs land there and must be moved
# into public/. The favicon source stays in public/, so favicon.ico is written there
# directly and needs no move.

web_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
cd -- "$web_root"

# Fail fast before mutating anything: oxipng is an external tool, not managed by
# mise, so it may be missing.
if ! command -v oxipng >/dev/null 2>&1; then
	echo "generate-icons: oxipng not found — install it first (brew install oxipng)" >&2
	exit 1
fi

pnpm exec pwa-assets-generator --config pwa-favicon-assets.config.ts
pnpm exec pwa-assets-generator --config pwa-assets.config.ts
pnpm exec pwa-assets-generator --config pwa-maskable-assets.config.ts

mv assets/icons/*.png public/

# The generators emit unoptimized PNGs. Lossless only — palette/lossy quantization
# bands the gold gradient. Globs stay version-agnostic so bumping the icon version
# never touches this script.
oxipng -o max --strip safe public/apple-touch-icon*.png public/icon-*.png
