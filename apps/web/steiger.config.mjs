import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

// Tests are not FSD units: co-located `*.test.*` files otherwise double every
// module's file count, so grouping/slice rules (e.g. shared-lib-grouping)
// measure files instead of concerns. Ignore them globally.
export default defineConfig([...fsd.configs.recommended, { ignores: ['**/*.test.ts', '**/*.test.tsx'] }])
