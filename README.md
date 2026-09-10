# Jeffrey's Jukebox

Jeffrey's Jukebox is an immersive, one-of-one neighborhood-bar music player built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, the Web Audio API, and native browser media features.

The visual thesis is **analog Indianapolis listening room**: the interface should feel like walking up to a battered private-pressing jukebox at the Alley Cat, not opening a generic streaming app.

## Current experience

- A persistent Alley Cat back-room photograph anchors the experience.
- **Walk Up & Pick a Real Recording** moves the camera into the playable jukebox.
- The catalog now contains **real recordings only**. Generated/fake title cards have been removed.
- The five recordings that originally shipped remain available.
- Additional Jacob Darling recordings are sourced from the supplied Google Drive archives.
- Drive recordings are served through `app/api/audio/[id]/route.ts`, which proxies the shared files through the app and forwards range-related audio headers where available.
- The title catalog is paginated from the actual catalog letters rather than assuming 120 fake slots.
- The Web Audio analyser drives the machine VU meter plus a new room-scale audio-reactive ambient spectrum and glow.
- A persistent player supports pause/resume, previous/next, progress, click-to-seek, and keyboard seeking.
- Media Session metadata supports lock-screen/device playback controls where the browser allows it.
- Native Remote Playback is exposed on compatible browsers/devices.
- Pointer parallax and cabinet tilt provide depth without requiring a heavy 3D framework.
- Reduced-motion behavior is preserved.

## Catalog

The source of truth is `lib/tracks.ts`.

Current catalog groups include:

- the original Jeffrey Taylor Cloudinary recordings
- selected, deduplicated Jacob Darling recordings from the existing shared Drive archive
- web-ready MP3 selections from the September 2026 Drive folder

Large WAV/FLAC masters stay in Drive for now. They should be normalized and moved to durable media delivery before being added to production playback.

### Audio source folders

Existing archive:

`https://drive.google.com/drive/folders/1eL4osoCpmMGvaxp8Q_4MUTxE-jIUtyIn`

September 2026 additions:

`https://drive.google.com/drive/folders/1iSB3JdCw3SUy7OzbzMlekUT2MSVrnhrA`

## Run locally

```bash
npm install
npm run dev -- --hostname 127.0.0.1
```

Open `http://127.0.0.1:3000`.

## Quality checks

```bash
npm run typecheck
npm run build
npm run check
```

`npm run check` is the default pre-merge verification path.

## Interaction shortcuts

When standing at the machine and focus is not inside a control:

- `Space` — pause/resume
- `←` — previous real recording
- `→` — next real recording
- `Esc` — step back from the machine

The persistent progress strip also accepts left/right keys for 10-second seeking.

## Architecture

- `app/page.tsx` — Server Component entry point
- `app/api/audio/[id]/route.ts` — shared-Drive audio proxy
- `components/jukebox.tsx` — listening-room orchestration
- `components/JukeboxCabinet.tsx` — machine/catalog/playback surface
- `components/MusicDock.tsx` — persistent playback controls
- `components/AudioReactiveAura.tsx` — analyser-driven room visualization
- `components/VuMeter.tsx` — analyser-driven machine meter
- `hooks/useJukeboxAudio.ts` — playback state, Web Audio graph, seeking, catalog navigation
- `hooks/useRemotePlayback.ts` — native Remote Playback support
- `hooks/useSceneParallax.ts` — low-cost room parallax
- `lib/tracks.ts` — real recording catalog
- `app/globals.css` — core room/cabinet styling
- `app/jukebox-effects.css` — audio-reactive and new enhancement styling

## Audio delivery strategy

The original five tracks remain versioned Cloudinary assets. Newly cataloged recordings can play from shared Google Drive through the same-origin proxy route.

The Drive proxy is a practical ingestion bridge, not the ideal final CDN architecture. As the catalog stabilizes:

1. identify canonical versions and remove duplicates
2. normalize loudness and export web-ready masters
3. upload canonical files to Cloudinary or another dedicated audio/CDN layer
4. replace Drive proxy URLs in `lib/tracks.ts` while keeping the catalog identity stable
5. retain Drive as the source/master archive

## Design rules

- Keep the room illusion and physical-machine metaphor.
- Real recordings only; do not generate filler tracks.
- Avoid turning the app into a generic Spotify-style library.
- Prefer audio-reactive, physical, tactile interactions over decorative dashboard UI.
- Keep motion purposeful and respect `prefers-reduced-motion`.
- Avoid new heavy dependencies unless they create a clearly better experience than CSS, Canvas, or the existing Web Audio graph.
- If a true 3D feature is introduced, isolate it behind progressive enhancement so playback remains fast and reliable on mobile.

## Quick smoke test

- [ ] Arrival photo loads and the walk-up hotspot is usable.
- [ ] Walking up reveals the cabinet without layout breakage.
- [ ] Catalog contains only real recordings and page navigation stops at the last real page.
- [ ] Original Jeffrey track plays from Cloudinary.
- [ ] Drive-backed Jacob track plays through `/api/audio/[id]`.
- [ ] VU meter and ambient visualizer react while audio is playing.
- [ ] Pause/resume and previous/next work from the cabinet.
- [ ] Persistent dock appears after playback begins.
- [ ] Clicking the progress strip seeks.
- [ ] Space/arrow/Escape shortcuts work outside focused controls.
- [ ] Remote Playback control remains hidden where unsupported.
- [ ] Mobile layout remains usable.
- [ ] Reduced-motion mode does not depend on animated effects.
- [ ] `npm run check` completes successfully.

## Deployment

The GitHub repository is connected to Vercel. Non-production branches create preview deployments through the Git integration; `main` is production.

Because Drive-backed tracks use a Route Handler, the current application is no longer purely static. Vercel must allow the Node.js route runtime used by `app/api/audio/[id]/route.ts`.
