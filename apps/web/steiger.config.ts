import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

// steiger's config type (ConfigObject/Plugin/Rule/GlobalIgnore) is not exported, so the inferred
// default-export type leaks those private names and trips TS4082 under composite declaration emit.
// Annotate with the public return type so the emitted .d.ts references only the exported
// defineConfig, not its private internals.
const config: ReturnType<typeof defineConfig> = defineConfig([...fsd.configs.recommended])

export default config
