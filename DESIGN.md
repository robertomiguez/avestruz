---
name: Avestruz
description: A lightweight mobile Nostr client for decentralized social feeds.
colors:
  nostr-blue-50: "#eff6ff"
  nostr-blue-100: "#dbeafe"
  nostr-blue-500: "#3880ff"
  nostr-blue-600: "#3171e0"
  nostr-cyan-500: "#3dc2ff"
  relay-indigo-500: "#5260ff"
  verified-blue: "#2563eb"
  ink-950: "#111827"
  ink-800: "#1f2937"
  neutral-700: "#374151"
  neutral-500: "#6b7280"
  neutral-300: "#d1d5db"
  line-200: "#e6ecf0"
  canvas-50: "#f4f5f8"
  paper: "#ffffff"
  success-500: "#2dd36f"
  warning-500: "#ffc409"
  danger-500: "#eb445a"
typography:
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
rounded:
  xs: "2px"
  sm: "3px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.nostr-blue-500}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.nostr-blue-500}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
    borderColor: "{colors.nostr-blue-500}"
  card-post:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-950}"
    rounded: "{rounded.sm}"
    padding: "30px"
    borderColor: "{colors.line-200}"
  input-default:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-950}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
    borderColor: "{colors.neutral-300}"
  avatar-post:
    width: "45px"
    height: "45px"
    rounded: "{rounded.full}"
  avatar-profile:
    width: "170px"
    height: "170px"
    rounded: "{rounded.full}"
---

# Design System: Avestruz

## 1. Overview

**Creative North Star: "The Clear Relay Window"**

Avestruz should feel like a small, fast window into public Nostr relays. The product is not trying to be a maximal social network. It should make notes, profiles, relay origin, and identity state easy to scan while staying light enough for mobile use.

The current UI is Ionic-first, with system typography, default Ionic blue actions, white feed cards, thin dividers, circular avatars, and compact profile surfaces. The design direction should refine that foundation instead of replacing it with a marketing-heavy or dashboard-like system.

Key characteristics:
- Mobile-first feed reading with a narrow, comfortable content column.
- White cards and simple dividers for posts, profile panels, and compose surfaces.
- Blue as the primary action and trust cue, including verified identity state.
- Relay and identity details present but visually secondary.
- Plain, resilient states for missing metadata, slow relays, and partial data.

## 2. Colors

The palette follows Ionic defaults with a practical social-feed layer.

### Primary
- **Nostr Blue** (#3880ff): Primary actions, login, publish, links, and active controls.
- **Blue Shade** (#3171e0): Pressed and hover treatment for primary actions.
- **Relay Cyan** (#3dc2ff): Secondary protocol accents and informational states.
- **Relay Indigo** (#5260ff): Optional accent for identity, relay, or advanced protocol surfaces.

### Neutral
- **Feed Ink** (#111827): Primary text.
- **Body Ink** (#374151): Secondary body text.
- **Metadata Gray** (#6b7280): timestamps, relay URLs, helper text, and low-priority details.
- **Feed Line** (#e6ecf0): Post separators and card borders.
- **App Canvas** (#f4f5f8): Page background.
- **Paper** (#ffffff): Feed cards, inputs, sheets, and profile panels.

### Status
- **Verified Blue** (#2563eb): NIP-05 verified state and trustworthy identity indicators.
- **Success Green** (#2dd36f): Successful publish, connected relay, or valid key state.
- **Warning Yellow** (#ffc409): Degraded relay or incomplete profile state.
- **Danger Red** (#eb445a): Invalid key, failed publish, or malformed event state.

### Named Rules

**The Protocol Color Rule.** Blue carries actions and trust. Relay, metadata, and diagnostic details should stay quieter unless they require user action.

## 3. Typography

**Display Font:** system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif  
**Body Font:** system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif  
**Label Font:** system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif

The typography should feel native, compact, and readable. Feed content needs enough breathing room for short posts and media links, while metadata should stay small and unobtrusive.

### Hierarchy
- **Headline** (700, 24px, 1.3 line-height): Page titles and profile names.
- **Title** (600, 16-18px, 1.4 line-height): Card names, compose labels, and modal titles.
- **Body** (400-500, 14-16px, 1.5 line-height): Note content, profile descriptions, and form text.
- **Caption** (400, 12-13px, 1.4 line-height): timestamps, relay URLs, NIP-05, and pubkeys.
- **Label** (600, 12px, 1.3 line-height): buttons, chips, and compact state labels.

### Named Rules

**The Feed Scale Rule.** Use compact, stable type in the feed. Reserve larger type for profile headers and page-level headers only.

## 4. Layout And Elevation

Avestruz should keep a narrow feed column that works well on phones and remains readable on desktop. Current post and compose surfaces use a `400px` max width; future changes can widen carefully, but note content should not stretch across the full desktop viewport.

### Surface Vocabulary
- **Feed Surface:** White card, thin top and bottom borders, small radius, no heavy shadow.
- **Compose Surface:** Same width and border vocabulary as posts, with the publish action easy to reach.
- **Profile Surface:** Centered panel with banner, large avatar, profile metadata, and compact counts.
- **Overlay Surface:** Ionic modals, alerts, and sheets should use Ionic defaults unless there is a clear product reason to customize.

### Named Rules

**The Feed First Rule.** Layout decisions should protect feed readability before adding navigation, metrics, or decorative sections.

## 5. Components

### Buttons
- Use Ionic buttons by default.
- Primary actions use the Ionic primary color.
- Outline buttons are acceptable for login, join, back, and secondary actions.
- Keep touch targets at least 40px tall.

### Feed Cards
- Show avatar, display name or fallback pubkey, timestamp, note content, hashtags, relay, and action icons.
- Metadata should not compete with note content.
- Hardcoded or placeholder engagement counts should be removed or clearly replaced before shipping production interaction features.

### Profile Cards
- Keep banner, avatar, name, NIP-05, pubkey, and about text visible.
- Long pubkeys and relay URLs must wrap or truncate cleanly on mobile.
- Show verified identity only after a successful NIP-05 check.

### Composer
- Keep the composer compact and directly above the feed when no profile filter is selected.
- Disable or explain publishing when the user has no valid private key.
- Confirm failed publishes with visible feedback, not console-only errors.

### Media Content
- Render image and video links conservatively.
- Avoid injecting unsanitized HTML from relay content.
- Media should fit inside the feed column without horizontal scroll.

## 6. Do's And Don'ts

### Do
- Do keep the first screen focused on reading and publishing notes.
- Do make relay origin and identity state visible but secondary.
- Do handle missing profile fields with graceful fallbacks.
- Do keep NIP-05 and verification cues clear but restrained.
- Do preserve mobile readability and touch targets.
- Do use Ionic theme variables for cross-platform consistency.

### Don't
- Don't add algorithmic ranking, engagement loops, or noisy notification patterns.
- Don't imply relay data is complete or canonical.
- Don't make protocol details look like errors unless the user needs to act.
- Don't use oversized marketing layouts inside the app shell.
- Don't introduce decorative gradients, glass effects, or unrelated dashboard cards.
- Don't expose private key material in the UI or logs.
