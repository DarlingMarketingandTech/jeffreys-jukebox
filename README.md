# Jeffrey's Jukebox

A private, immersive neighborhood-bar jukebox for singer Jeffrey Taylor. The experience is presented as a one-of-one machine from **Darling Juke Joint Works · Indiana · Established 1985**.

## The experience

- The Alley Cat-style room remains visible from arrival through playback; the app never jumps to a generic music-player screen.
- The opening fades in from black and slowly settles into the room like walking through the bar door.
- **Walk Up & Pick a Song** uses a first-person camera move toward the same battered machine while leaving the neighboring bar environment visible.
- The title catalog is stocked with 120 numbered selections: A1–A10 through L1–L10.
- Five `JT`-marked selections contain Jeffrey's real recovered recordings.
- Decorative selections politely behave like records that are listed but not loaded.
- The title book flips in paired pages: A/B, C/D, E/F, and so on.
- The visible record changer selects, places, spins, and lowers its tonearm during playback.
- **Light One Up** ramps a native Canvas 2D smoke field through the whole room while a subtle Web Audio treatment warms the sound.
- The smoke is cursor-reactive, device-pixel-ratio aware, and fully stops its animation loop at zero density to preserve battery.
- Left and right room views use real Alley Cat pool-room, signed-wall, and graffiti-alley photography without leaving the listening room.
- Side views reveal an interactive cardboard coaster that switches between sober bar advice and hazy late-night realizations.
- The crooked napkin card serves another thought without leaving the room or interrupting the record.
- The arrival plaque opens a compact Alley Cat history card using the real exterior and 6267 Carrollton Ave details.
- A lightweight analyser shared with the existing Web Audio graph drives a red-orange joint ember from Jeffrey's real-time vocal and music levels.
- Music continues while browsing title cards, turning pages, changing the room mood, looking around, or stepping away from the machine.
- A persistent now-playing strip keeps pause/resume, progress, and track identity available outside the close-up.
- Supported browsers expose their native Remote Playback picker for compatible TVs and speakers; unsupported devices hide that control.
- Media Session metadata gives Jeffrey useful lock-screen and device-level track information where supported.
- Large controls, keyboard focus states, responsive layouts, and reduced-motion support are included.

## Run locally

```bash
npm install
npm run dev -- --hostname 127.0.0.1
```

Open `http://127.0.0.1:3000`.

## Jeffrey's recovered tracks

The five loaded entries at the top of `lib/tracks.ts`:

- `A3` — Back Room Serenade
- `C7` — Last Call Waltz
- `F2` — Neon on Carrollton
- `H8` — Pool Table Moon
- `L4` — Superman (Cover)

Change the `title` and `artist` values without changing the Cloudinary audio URLs or selection codes.

## Audio delivery

The five recordings are public, versioned MP3 assets in Cloudinary cloud `dr0xs4iar`, under `jeffreys-jukebox/audio`. Playback uses the Web Audio API only for the optional room treatment; the source recordings are not altered.

## Front-end architecture

The UI uses React 19, the Next.js 16 App Router, fully typed TypeScript, Tailwind CSS v4 semantic theme tokens, a global React 19 mood context, native Canvas 2D smoke rendering, and the native Web Audio API. No animation framework is shipped.

`app/page.tsx` remains a Server Component and wraps the complete experience in `MoodProvider`. The client-side `JukeboxStage` is the integration master: it supplies the smoke as the atmosphere slot and the coaster as the foreground slot without moving or remounting the jukebox audio element. The rendered stack is explicitly ordered as authentic room photo, smoke, mechanical cabinet, then interactive controls and coaster.

Core logic is split across:

- `hooks/useJukeboxAudio.ts` — Web Audio graph, mood filter, analyser state, playback
- `hooks/useRemotePlayback.ts` — Remote Playback API state
- `components/JukeboxCabinet.tsx` — visual machine only
- `components/MusicDock.tsx` — persistent now-playing strip
- `components/HazeLighter.tsx` — brass lighter ignition ritual
- `components/jukebox.tsx` — room navigation and orchestration

## 5-minute smoke test checklist

Run `npm run build` first. Then open `http://127.0.0.1:3000` and verify each item before claiming done.

### Arrival and navigation

- [ ] Page fades in from black; room photo is visible (not a blank screen).
- [ ] **← POOL ROOM** shows the pool-room photo and story header **THE BACK ROOM**.
- [ ] **JUKEBOX** returns to center / intro view.
- [ ] **SIGNED WALL →** shows the signed-wall photo and **SCRATCHED INTO THE WALL** story.
- [ ] **Walk Up & Pick a Song** animates toward the machine without breaking layout.

### Playback

- [ ] Select **A3** and press play; audio starts and vinyl spins.
- [ ] LED message shows track status; music dock appears with progress.
- [ ] Pause/resume works from both cabinet and dock.
- [ ] Skip prev/next moves between the five Jeffrey cuts only.
- [ ] Pick a dummy track (no JT mark); LED flashes **RECORD SCRATCHED. PICK ANOTHER, JEFF.**

### Haze and smoke

- [ ] **LIGHT ONE UP** (arrival) or cabinet lighter ignites within ~3 seconds of visible room fog.
- [ ] Status reads **ROOM: HAZY**; clearing returns **ROOM: CLEAR ENOUGH**.
- [ ] Smoke particles drift above the grain overlay (not invisible underneath).
- [ ] After 5+ minutes hazy, room gently breathes (lazy-drift).

### Side features

- [ ] Pool room view: joint ember visible top-right; pulses brighter during playback.
- [ ] Side views: coaster is anchored on the bar surface, not overlapping nav/dock.
- [ ] Coaster opens sober thoughts when clear; high thoughts when hazy.
- [ ] Marquee letter flickers; **SERVICED BY JACOB** sticker visible on cabinet.

### Layout (mobile + desktop)

- [ ] At 560px width: nav, dock, coaster, and ember do not overlap.
- [ ] At desktop width: same — all controls remain tappable.
- [ ] Music dock pushes look-controls up when visible.

### Build

- [ ] `npm run build` completes with zero errors.

## Deploy

The app is a static Next.js 16 App Router page and can be imported directly into Vercel from GitHub. No runtime environment variables are required.
