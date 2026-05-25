# Product

## Overview

Avestruz is a lightweight, mobile-first Nostr client for reading public relay feeds, viewing profiles, and publishing text notes. It favors direct protocol participation over platform-specific timelines or hidden ranking.

## Current Scope

- Read kind 1 text notes from configured relays.
- Load kind 0 profile metadata for note authors.
- Filter the feed by selecting a profile.
- Publish signed text notes with a local `nsec` key.
- Generate a new local key for first-time users.
- Persist identity settings locally with Pinia persisted state.
- Display NIP-05 verification state when metadata includes a NIP-05 identifier.
- Render simple image and video URLs inside note content.

## Users

Avestruz serves people seeking a simple entry point into decentralized social media:
- Users exploring Nostr for the first time
- People who want portable identity and relay choice
- Communities moving away from centralized platforms
- Nostr enthusiasts who value a small, inspectable client

## Product Purpose

Avestruz should make basic Nostr participation understandable. A user should be able to open the app, see recent notes from configured relays, inspect author profiles, sign in with an `nsec`, and publish a note without learning every protocol detail first.

Success means the client stays transparent about where content comes from while keeping the interface fast, readable, and low-friction.

## Brand Personality

Open, lightweight, trustworthy. Avestruz should feel accessible without hiding the decentralized nature of the product. The interface should step out of the way and let notes, profiles, relays, and identity cues carry the experience.

## Anti-references

Avoid:
- Heavy, cluttered social media feeds
- Proprietary algorithms and platform lock-in
- Noisy notification systems
- Misleading engagement metrics
- Overly technical interfaces that discourage casual use
- Dark patterns that exploit user attention
- Treating relay data as complete, ordered, or guaranteed

## Design Principles

- Lightweight and responsive: fast load times, minimal friction on mobile and desktop.
- Transparent mechanics: users should understand that content comes from configured relays.
- Respect user agency: no hidden ranking, no forced account system, no unnecessary notifications.
- Mobile-first: touch-friendly controls and readable feed cards.
- Protocol-aware: surface identity, relay, NIP-05, and key state carefully without overwhelming users.
- Resilient by default: partial relay failures and missing metadata should degrade gracefully.

## Accessibility & Inclusion

Target WCAG AA compliance. Prioritize:
- Readable contrast and clear hierarchy
- Reliable keyboard navigation and touch targets
- Clear loading and error states for slow or unavailable relays
- Plain language for key, relay, and profile concepts
