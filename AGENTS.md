# Avestruz AI Rules

## Core
- Minimal diffs. Do not touch unrelated files.
- Ask before large changes or unclear product, protocol, or persistence logic.
- No new dependencies.
- No formatting-only changes.
- Be concise; show diffs.

## Stack
Vue 3, Vite, TypeScript, Pinia, Vue Router, Ionic Vue, Capacitor, nostr-tools, ionicons, pinia-plugin-persistedstate, Vitest.

## Architecture
- `components/`: UI building blocks and narrow UI event handlers. Keep relay/protocol work out of components.
- `stores/`: Pinia state for events, settings, and UI state. Persist only intentional user settings or identity state.
- `services/`: Nostr relay, NIP-05, signing, publishing, and other external protocol access.
- `composables/`: reusable local logic only; no relay or storage side effects.
- `views/`: pages that compose components and coordinate page lifecycle through stores/services.
- `types/`: shared TypeScript interfaces for Nostr events, profiles, and derived view models.

## Frontend
- Use Composition API with TypeScript.
- Prefer Ionic components, props, and theme variables over custom controls.
- Use scoped CSS or `src/theme/*` for styling. Avoid adding inline styles in templates.
- Keep mobile layout as the primary target, with desktop treated as a wider reading surface.

## Nostr Integration
- Use `nostr-tools` for protocol interactions.
- Read relay URLs and limits from Vite environment variables.
- Respect Nostr event filtering and relay protocol.
- Never assume relay responses, event ordering, metadata presence, or event shape.
- Validate and verify signed events before publishing.
- Handle malformed relay messages, bad profile JSON, NIP-05 failures, and relay disconnections gracefully.
- Do not log private keys or signed secrets.

## Verification
- Run focused checks for changed code when practical: `npm run build`, `npm run test:unit`, or narrower commands.
- Use Context7 when available for unfamiliar or version-sensitive API signatures.
