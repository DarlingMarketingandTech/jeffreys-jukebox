# AGENTS.md - Jeffrey's Jukebox

Last reviewed: 2026-09-10

This is the durable agent handoff for Jeffrey's Jukebox. Read it before changing audio, catalog behavior, interaction design, or deployment architecture.

## Product identity

Jeffrey's Jukebox is an immersive private-listening-room web app. Its visual thesis is **analog Indianapolis listening room**: walking up to a one-of-one battered jukebox in the Alley Cat back room, not opening a generic streaming service.

Current direction:

- Real recordings only. Do not generate filler title cards.
- Preserve the room photograph and physical-machine metaphor.
- Keep playback reliable and lightweight before adding heavy 3D dependencies.
- Favor tactile, audio-reactive interactions that reinforce the jukebox illusion.

## Repository and deployment

- Repo: `DarlingMarketingandTech/jeffreys-jukebox`
- Default branch: `main`
- Production: `https://jeffreys-jukebox.vercel.app/`
- Vercel project: `jeffreys-jukebox`
- Vercel team: `darling-mar-tech`
- Framework: Next.js 16 App Router
- Vercel Node line: 24.x
- `next.config.ts` enables `cacheComponents: true`.

Important Next.js 16 constraint: with Cache Components enabled, do not add legacy route-segment `dynamic`, `revalidate`, or `fetchCache` exports. Node.js is the required/default runtime.

## Stack

- Next.js `^16.0.0`
- React / React DOM `^19.2.4`
- TypeScript `^5.7.0`
- Tailwind CSS `^4.3.2`
- PostCSS `^8.5.19`
- Native Web Audio API
- Native Media Session API
- Native Remote Playback API when supported

Scripts:

```bash
npm run dev
npm run typecheck
npm run build
npm run check
```

`npm run check` runs typecheck plus production build and is the preferred pre-merge gate.

## Current architecture

- `app/page.tsx` — Server Component entry.
- `app/layout.tsx` — metadata, Open Graph/Twitter metadata, fonts, global styling imports.
- `app/globals.css` — core room and cabinet art direction.
- `app/jukebox-effects.css` — audio-reactive/new enhancement styles.
- `app/api/audio/[id]/route.ts` — same-origin bridge for selected shared Google Drive recordings; forwards byte-range headers where available.
- `components/JukeboxStage.tsx` — client boundary wrapper.
- `components/jukebox.tsx` — room orchestration, camera state, Media Session, keyboard shortcuts, audio element.
- `components/JukeboxCabinet.tsx` — physical catalog and main controls.
- `components/MusicDock.tsx` — persistent player and seek surface.
- `components/AudioReactiveAura.tsx` — lightweight room-scale analyser visualization.
- `components/VuMeter.tsx` — machine-level analyser visualization.
- `hooks/useJukeboxAudio.ts` — playback, Web Audio graph, seeking, navigation, timing.
- `hooks/useRemotePlayback.ts` — browser Remote Playback integration.
- `hooks/useSceneParallax.ts` — pointer parallax with reduced-motion support.
- `hooks/useCabinetTilt.ts` — physical cabinet tilt.
- `lib/tracks.ts` — canonical playable catalog.
- `docs/audio-catalog.md` — Drive inventory, duplicates, and normalization backlog.
- `docs/qa-smoke-test.md` — fast verification path.

## Audio catalog

`lib/tracks.ts` is the source of truth. The September 2026 real-catalog pass contains 52 playable entries:

- 5 original Jeffrey Taylor cuts remain on versioned Cloudinary URLs.
- 20 selected/deduplicated Jacob Darling recordings from the existing shared Drive archive.
- 27 selected MP3 recordings from the newer September Drive folder.

The old 120-title generated catalog and its fake artists/titles are intentionally removed.

The first five original recordings are now compactly coded A1-A5 inside the real-only catalog. Do not assume the older A3/C7/F2/H8/L4 slot layout still applies.

## Drive source libraries

Existing archive:

`https://drive.google.com/drive/folders/1eL4osoCpmMGvaxp8Q_4MUTxE-jIUtyIn`

September 2026 additions:

`https://drive.google.com/drive/folders/1iSB3JdCw3SUy7OzbzMlekUT2MSVrnhrA`

These folders are master/source libraries. They include duplicates, alternate takes, M4A files, large WAV masters, FLAC material, and finished MP3s.

Current policy:

1. Deduplicate obvious copies.
2. Prefer already web-friendly recordings for immediate catalog additions.
3. Keep large WAV/FLAC masters out of browser delivery until listened to, classified, normalized, and exported.
4. Long term, move canonical web masters to Cloudinary or another dedicated media/CDN layer and leave Drive as the archive.
5. Never claim a file is a finished song, original, cover, instrumental, or preferred master based only on its filename; verify by listening when that distinction matters.

See `docs/audio-catalog.md` for exact Drive IDs and the normalization backlog.

## Playback behavior

- Every visible catalog entry is intended to be a real playable recording.
- Previous/next moves through the real catalog.
- Catalog pages are derived from actual track-code letters rather than a hard-coded 120-slot book.
- Audio continues while browsing.
- The persistent dock supports click-to-seek and keyboard ±10-second seeking.
- Global shortcuts while at the machine and outside focused controls:
  - `Space`: pause/resume
  - `←`: previous recording
  - `→`: next recording
  - `Esc`: step back
- The Web Audio analyser currently uses `fftSize = 256` and drives both the VU strip and ambient room visualization.
- Remote Playback remains progressive enhancement only.

## UX and visual rules

- Do not turn the project into a Spotify clone, dashboard, card grid, or generic SaaS interface.
- Maintain the single-scene room illusion and make the machine feel physical.
- New visuals should feel analog, worn, neon-lit, brass/chrome, photographic, and specific to Indianapolis bar culture.
- Audio-reactive motion should be subtle enough that the recording stays primary.
- Respect `prefers-reduced-motion`.
- Keep keyboard focus visible and controls usable on mobile.
- A true Three.js / React Three Fiber layer is a future option, not a default dependency. Introduce it only if a specific 3D interaction justifies bundle and rendering cost, and keep playback functional without WebGL.

## Deployment safety

Work on a branch and use a PR unless the user explicitly requests direct main changes.

Before merging:

1. Run or obtain `npm run check` through CI/Vercel.
2. Verify Vercel preview is green.
3. Play one original Cloudinary track.
4. Play at least two Drive-backed tracks from different source folders.
5. Test seeking and next/previous.
6. Confirm the analyser visuals react.
7. Test a narrow mobile viewport.
8. Test reduced-motion behavior.

Do not merge a red Vercel preview.

## Next improvement targets

- Normalize and CDN-publish the WAV/M4A backlog after listening/classification.
- Optimize or replace the approximately 2.48 MB `public/images/intro-screen.png` while preserving its look.
- Create a dedicated social/OG image instead of relying permanently on the room screenshot.
- Consider richer record-sleeve or label artwork per canonical track once titles/masters are verified.
- Consider one optional progressive-enhancement 3D feature, such as an inspectable spinning 45 or audio-reactive chrome/neon geometry, only after the core real-catalog build is stable.

## Future-agent start sequence

1. Read this file.
2. Read `README.md`.
3. Inspect `lib/tracks.ts` and `docs/audio-catalog.md` for any audio work.
4. Inspect `components/jukebox.tsx`, `components/JukeboxCabinet.tsx`, and `hooks/useJukeboxAudio.ts` for interaction work.
5. Check current GitHub/Vercel status before diagnosing deployment behavior.
6. Keep source/master Drive files separate from production delivery decisions.
