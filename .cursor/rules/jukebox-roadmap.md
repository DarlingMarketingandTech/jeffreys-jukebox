# Project Context: Jeffrey's Jukebox (Cabinet-First Installation)

## Core Vision: The Digital One-of-One
A premium, high-fidelity mechanical installation. The interface is not a "web page" — it is a virtual object. Prioritize mechanical realism and auditory immersion.

## Tech Stack
- **Framework:** Next.js 16 (App Router + RSC)
- **Rendering:** React 19 (Compiler-optimized, memoization-free)
- **Styling:** Tailwind CSS v4 (CSS-first, semantic tokens in `app/globals.css` `@theme`)
- **Bundler:** Turbopack (default)
- **Performance:** Partial Prerendering via `cacheComponents: true` for the instant "walk-up" feel

## Roadmap
### Phase 1 — The Mechanical Cabinet
- Native CSS 3D transforms (`perspective`, `rotateY`) for the cabinet
- Responsive title catalog (A1–L10) driven by container queries on `.catalog`
- "Walk-Up" state management: Intro → Walking → Active (`standing-back` / `camera-moving` / `approached`)

### Phase 2 — Playback Engine
- Web Audio graph: source → analyser → dry gain + (lowpass → convolver → wet gain) in `hooks/useJukeboxAudio.ts`
- Mechanical quirks: simulated needle skips (`lib/scratchSound.ts`), analog selector/needle arms, dummy title-card rejection
- No canvas particles — clean audio-sync visualizers only (`components/VuMeter.tsx`)

### Phase 3 — Interaction & Narrative
- The "Coaster" interaction (`components/BarPhilosophy.tsx` — bar notes inside, alley thoughts outside)
- High-fidelity photography assets for the bar environment (`public/images/`)
- "Inside" ↔ "Outside" navigation via `lib/mood.tsx` `RoomView` and `components/DoorSwitch.tsx`; outside, music plays muffled through the wall (lowpass + reverb)

## Engineering Principles
1. **Mechanical Realism:** If the jukebox moves, it must feel heavy — easing and delays simulate analog mechanics.
2. **Server-First:** If data doesn't need client interaction, it remains an RSC.
3. **Cleanliness:** No ghost code. If a feature distracts from the cabinet, it is removed.
4. **Performance:** 60fps cabinet responsiveness; keep per-frame work off React state (direct DOM writes in rAF loops).
