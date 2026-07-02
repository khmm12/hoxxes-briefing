// Dev-only public API of the briefing slice, kept separate from index.ts so the
// playground never enters the production module graph (the app router imports
// it lazily behind import.meta.env.DEV).
export { PlaygroundPage } from './dev/PlaygroundPage'
