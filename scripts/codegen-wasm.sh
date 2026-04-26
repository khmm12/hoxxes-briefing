#!/bin/sh

set -eu

package_name="@hoxxes-briefing/wasm"

workspace_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
crate_root="$workspace_root/crates/drg_mission_gen_wasm"
pkg_root="$crate_root/pkg"
pkg_gitignore="$pkg_root/.gitignore"
package_json="$pkg_root/package.json"
pkg_js_entry="$pkg_root/drg_mission_gen_wasm.js"
pkg_wasm_entry="$pkg_root/drg_mission_gen_wasm_bg.wasm"
pkg_types_entry="$pkg_root/drg_mission_gen_wasm.d.ts"

if ! command -v wasm-pack >/dev/null 2>&1
then
  printf '%s\n' 'error: wasm-pack is required; run mise install and activate the mise environment' >&2
  exit 1
fi

if ! command -v wasm-bindgen >/dev/null 2>&1
then
  printf '%s\n' 'error: wasm-bindgen is required; run mise install and activate the mise environment' >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1
then
  printf '%s\n' 'error: jq is required' >&2
  exit 1
fi

cd "$workspace_root"

# The generated package is consumed by the server-side API; skip wasm-opt so
# codegen does not depend on an extra Binaryen installation.
wasm-pack build crates/drg_mission_gen_wasm --target bundler --out-dir pkg --no-opt

rm -f "$pkg_gitignore"

if [ ! -f "$package_json" ]
then
  printf 'error: expected wasm package manifest at %s\n' "$package_json" >&2
  exit 1
fi

tmp_file=$(mktemp)
trap 'rm -f "$tmp_file"' EXIT

jq --arg name "$package_name" '.name = $name' "$package_json" > "$tmp_file"
mv "$tmp_file" "$package_json"

for output_file in "$pkg_js_entry" "$pkg_wasm_entry" "$pkg_types_entry"
do
  if [ ! -f "$output_file" ]
  then
    printf 'error: expected wasm output at %s\n' "$output_file" >&2
    exit 1
  fi
done
