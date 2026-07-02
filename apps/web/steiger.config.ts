import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

// steiger's config type (ConfigObject/Plugin/Rule/GlobalIgnore) is not exported, so the inferred
// default-export type leaks those private names and trips TS4082 under composite declaration emit.
// Annotate with the public return type so the emitted .d.ts references only the exported
// defineConfig, not its private internals.
//
// Tests are not FSD units: co-located `*.test.*` files otherwise double every
// module's file count, so grouping/slice rules (e.g. shared-lib-grouping)
// measure files instead of concerns. Ignore them globally.
const config: ReturnType<typeof defineConfig> = defineConfig([
  ...fsd.configs.recommended,
  { ignores: ['**/*.test.ts', '**/*.test.tsx'] },
])

export default config
