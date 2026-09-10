# AGENTS.md - Jeffrey's Jukebox

Last reviewed: 2026-09-10

This file is the durable agent handoff for the Jeffrey's Jukebox repo and app. It is intended to be added to ChatGPT project sources so future agents can get oriented before editing.

## Project identity

Jeffrey's Jukebox is a private, immersive listening-room web app built for the recovered recordings associated with Jeffrey Taylor and the Alley Cat / Indianapolis neighborhood-bar concept. The site should feel like walking up to an old custom jukebox in a real bar room, not like a generic playlist or audio player.

Core experience currently observed in the repo:

- A Next.js App Router page renders a single client-side jukebox stage.
- The arrival view uses `/public/images/intro-screen.png` as the persistent photo-based room backdrop.
- The user walks up through a hotspot labelled `WALK UP & PICK A SONG`.
- The jukebox contains 120 visible title-card selections, but only 5 loaded recordings.
- Loaded tracks are marked with `JT` and use Cloudinary-hosted MP3 URLs.
- Decorative / unloaded selections intentionally reject playback with a record-scratch message.
- Playback is handled by a native `<audio>` element plus Web Audio analyser state for visual feedback.
- Remote Playback is exposed when the browser supports the native Remote Playback API.

## Live deployment

- Production URL: `https://jeffreys-jukebox.vercel.app/`
- Vercel team: `darling-mar-tech`
- Vercel project: `jeffreys-jukebox`
- Vercel project id: `prj_1dpV0ozlowJV8Nti8lgWpNUvx2a0`
- Latest reviewed production deployment id: `dpl_3is6uChvEfRpV13xTurpXY4Hrc1p`
- Latest reviewed deployment state: `READY`
- Latest reviewed deployment target: `production`
- Vercel framework: `nextjs`
- Vercel Node version: `24.x`
- Recent reviewed production runtime errors: none found for the prior 7 days.

## GitHub repository

- Repo: `DarlingMarketingandTech/jeffreys-jukebox`
- Default branch: `main`
- Visibility at review time: public
- Primary language: TypeScript
- Homepage metadata: `https://jeffreys-jukebox.vercel.app`

## Stack and scripts

Package name: `jeffreys-jukebox`

Runtime and framework:

- Next.js `^16.0.0`
- React `^19.2.4`
- React DOM `^19.2.4`
- TypeScript `^5.7.0`
- Tailwind CSS `^4.3.2`
- PostCSS `^8.5.19`

Available npm scripts:

```bash
npm install
npm run dev
npm run build
npm run start
```

The README local run command uses:

```bash
npm run dev -- --hostname 127.0.0.1
```

Open `http://127.0.0.1:3000` for local review.

## Important source files

- `app/page.tsx` - server component entry point; imports `JukeboxStage` and `tracks`.
- `app/layout.tsx` - metadata, viewport, global CSS import, Google font setup.
- `app/globals.css` - main visual system and layout styling. This is currently a large CSS file and should be edited carefully.
- `components/JukeboxStage.tsx` - lightweight client wrapper around `Jukebox`.
- `components/jukebox.tsx` - primary room orchestration, Media Session handlers, camera state, audio element, cabinet and music dock integration.
- `components/JukeboxCabinet.tsx` - visual jukebox machine, catalog UI, playback controls, volume control, remote playback button.
- `components/MusicDock.tsx` - persistent now-playing strip.
- `components/VuMeter.tsx` - analyser-driven visual feedback.
- `hooks/useJukeboxAudio.ts` - audio state, Web Audio graph, track selection, rejection behavior, transport, elapsed/duration, autoplay-safe playback attempts.
- `hooks/useRemotePlayback.ts` - native Remote Playback API availability, state, prompt handling.
- `hooks/useSceneParallax.ts` - pointer-driven room parallax that respects `prefers-reduced-motion`.
- `hooks/useCabinetTilt.ts` - cabinet pointer tilt behavior.
- `lib/tracks.ts` - track catalog, Cloudinary audio URL builder, 5 loaded recordings, 120 decorative records.
- `lib/scratchSound.ts` - unloaded-record rejection sound.
- `public/images/` - image assets used by the room / jukebox experience.

## Current loaded recordings

The app currently loads five Cloudinary MP3s from cloud `dr0xs4iar` under `jeffreys-jukebox/audio`:

| Code | Current title | Artist | Source note |
| --- | --- | --- | --- |
| A3 | Back Room Serenade | Jeffrey Taylor | `track-01` |
| C7 | Last Call Waltz | Jeffrey Taylor | `track-02` |
| F2 | Neon on Carrollton | Jeffrey Taylor | `track-04`; code comment says `track-03` is missing from Cloudinary |
| H8 | Pool Table Moon | Jeffrey Taylor | `track-05` |
| L4 | Superman (Cover) | Jeffrey Taylor | `superman-cover` |

Do not casually change selection codes or Cloudinary URLs. If new audio is added, preserve the jukebox selection model and intentionally map each loaded track to a stable jukebox code.

## Google Drive audio source folder

User-provided Drive folder:

`https://drive.google.com/drive/folders/1eL4osoCpmMGvaxp8Q_4MUTxE-jIUtyIn?usp=sharing`

Reviewed folder contents are audio files only, including many Jacob Darling `.m4a` demos, several `.wav` masters, and duplicate variants. Examples include:

- `Jacob Darling - WAITIN FOR SUPERMAN.m4a`
- `Jacob Darling - WAITIN FOR SUPERMAN (1).m4a`
- `Jacob Darling - good good time.m4a` plus multiple numbered variants
- `Display Pie Remaster.wav`
- `dublin_Blues.wav`
- `Scotty Jams.wav`
- `Heps Duet (Mastered with Thunder at 54pct).mp3`
- `Pie_is_Pie (Mastered with Thunder at 0pct).wav`

This Drive folder should be treated as a source library / staging catalog, not as the current production delivery layer. The production app currently references Cloudinary assets from `lib/tracks.ts`.

Recommended future workflow before adding Drive tracks:

1. Inventory the Drive folder into a simple table: title, file id, format, size, created time, modified time, likely duplicate group, candidate status.
2. Listen / classify tracks before renaming or uploading.
3. Pick canonical versions for each song.
4. Convert or normalize for web delivery.
5. Upload final web-ready audio to a stable delivery location.
6. Add selected tracks to `lib/tracks.ts` with stable jukebox codes.
7. Run local build and playback smoke test.

## Design and product rules

- Preserve the one-of-one neighborhood-bar feel.
- Avoid turning the app into a normal streaming player UI.
- Keep the photo-room illusion intact: the room should remain visible during browsing and playback.
- Keep the jukebox as the center of interaction.
- Maintain large controls and keyboard-visible focus states.
- Respect reduced-motion preferences when adding parallax, animation, smoke, camera motion, or reactive effects.
- Keep decorative tracks as an intentional part of the experience unless a future product decision expands the real catalog.
- Do not add accounts, payments, comments, databases, or tracking unless the next phase explicitly calls for it.
- Favor small, verifiable improvements over large rewrites.

## Verification before claiming done

Minimum checks after code changes:

```bash
npm install
npm run build
npm run dev -- --hostname 127.0.0.1
```

Manual smoke test:

- Arrival page loads and photo background is visible.
- Hotspot walks up to the machine.
- Catalog pages turn.
- A loaded `JT` track plays.
- Pause / resume works from cabinet and dock.
- Previous / next skip among loaded tracks.
- A decorative non-`JT` track rejects playback intentionally.
- Volume control works.
- Layout remains tappable around 560px width and desktop width.
- No obvious overlap between dock, cabinet, transport controls, and hotspot.
- Reduced-motion users are not forced into pointer parallax or excessive motion.

## Known review notes

See `docs/initial-improvement-notes.md` for the initial low-hanging-fruit list captured during the 2026-09-10 review.

## Agent handoff guidance

When starting future work:

1. Read this file first.
2. Read `README.md`, but verify it against current code because the README may contain stale references to features removed in the latest production direction.
3. Inspect `lib/tracks.ts` before changing audio or title catalog behavior.
4. Inspect `components/jukebox.tsx`, `components/JukeboxCabinet.tsx`, and `hooks/useJukeboxAudio.ts` before changing interaction behavior.
5. Verify Vercel deployment state and runtime errors before diagnosing production issues.
6. Prefer a branch and PR for changes unless the user explicitly asks for a direct main-branch commit.
