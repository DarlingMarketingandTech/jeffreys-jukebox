# J&J Jukebox

J&J Jukebox is a private shared recording archive for Jacob Darling and Jeffrey Taylor, presented as a gritty Indianapolis dive-bar jukebox rather than a conventional streaming app.

The visual thesis is **after-hours dive-bar record vault**: a physical jukebox remains the memorable entry point, while a richer archive interface handles search, curation, playback, and eventually shared collaboration.

## Current product direction

- Private two-person app for Jacob and Jeffrey.
- No memorial, family, public-artist, or story-mode framing.
- Alley Cat / Indianapolis dive-bar atmosphere remains the environmental inspiration.
- Real recordings only.
- The launch catalog is intentionally curated to 17 tracks: five existing Jeffrey recordings plus Jacob's 12 selected recordings.
- Catalog buckets: **Featured**, **Archive**, and **Raw Demos**.
- The physical jukebox remains playable.
- A new **Record Vault** adds search, Jacob/Jeffrey filters, bucket shelves, unique sleeve-style placeholder artwork, and direct playback.
- Existing Web Audio analysis powers responsive VU and room effects without requiring WebGL for basic playback.

## Jacob launch shortlist

1. Display Pie
2. Scotty Jams
3. Hep's Duet
4. Waitin' for a Superman
5. Hep's Dreams
6. Back Home Again in Indiana
7. Big Country
8. Cletus Jam
9. Good Good Time
10. Dublin Blues
11. Nobody Knows You When You're Down and Out
12. A Look Back at 38

These are sourced from the curated Drive folder:

`https://drive.google.com/drive/folders/14eT_Ih1B8bWqTi94wrrseH8ihSv92bHV`

Dave Matthews Band concert material should not be added to the J&J catalog.

## Architecture

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4 + custom atmospheric CSS
- Web Audio API
- Media Session API
- Remote Playback API where supported
- Vercel deployment
- Supabase planned for private auth, shared data, and private uploads

Important files:

- `app/page.tsx` — server entry point
- `components/jukebox.tsx` — room, view switching, playback orchestration
- `components/JukeboxCabinet.tsx` — physical machine UI
- `components/RecordVault.tsx` — richer archive browser
- `components/MusicDock.tsx` — persistent player
- `components/AudioReactiveAura.tsx` — audio-reactive room layer
- `hooks/useJukeboxAudio.ts` — playback state and Web Audio graph
- `lib/tracks.ts` — curated launch catalog and bucket metadata
- `app/api/audio/[id]/route.ts` — Drive playback bridge
- `supabase/migrations/20260910203000_jj_private_archive.sql` — private backend schema scaffold

## Private backend plan

A dedicated Supabase project will provide:

- exactly approved J&J members via Supabase Auth
- RLS-protected tracks
- track comments
- playlists and playlist tracks
- favorites
- mood tags
- upload records
- a private `jj-recordings` Storage bucket for future direct uploads/recordings

Do not repurpose unrelated existing Supabase projects. Create a dedicated J&J project and apply the checked-in migration.

## Future recording workflow

The intended eventual workflow is:

1. Sign in as Jacob or Jeffrey.
2. Upload an existing audio file or record a new take in-browser.
3. Save it initially as a Raw Demo.
4. Add title, artist, type, tags, and optional artwork.
5. Listen and comment together.
6. Promote it to Archive or Featured when ready.

Do not build a DAW in this app. Capture/import, organization, playback, and collaboration are the product goals.

## 3D direction

Do not make the entire app WebGL-dependent. The baseline jukebox and Record Vault should remain fast HTML/CSS/React.

A future isolated, lazy-loaded 3D mode may use the existing analyser data for a fullscreen record/jukebox visualizer or room interaction. It should be progressive enhancement and never block playback on mobile.

## Run locally

```bash
npm install
npm run dev -- --hostname 127.0.0.1
```

## Quality checks

```bash
npm run typecheck
npm run build
npm run check
```

## Interaction shortcuts

- `Space` — pause/resume
- `←` / `→` — previous/next recording
- `V` — open/close Record Vault while at the machine
- `Esc` — close vault or step back

## Deployment

The GitHub repository is connected to Vercel. Feature branches create previews; `main` is production.

The app currently uses Drive as an ingestion/playback bridge and Cloudinary for the original Jeffrey tracks. As canonical masters are selected, move production audio toward a dedicated private media/storage layer while keeping Drive as a source archive.
