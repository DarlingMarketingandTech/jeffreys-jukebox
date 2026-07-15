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

## Rename Jeffrey's recovered tracks

Edit the five loaded entries at the top of `lib/tracks.ts`. The current cabinet locations are:

- `A3` — Track One
- `C7` — Track Two
- `F2` — Track Four
- `H8` — Track Five
- `L4` — Superman (Cover)

Change the `title` and `artist` values without changing the Cloudinary audio URLs or selection codes.

## Audio delivery

The five recordings are public, versioned MP3 assets in Cloudinary cloud `dr0xs4iar`, under `jeffreys-jukebox/audio`. Playback uses the Web Audio API only for the optional room treatment; the source recordings are not altered.

## Front-end architecture

The UI uses React 19, the Next.js 16 App Router, fully typed TypeScript, Tailwind CSS v4 semantic theme tokens, a global React 19 mood context, native Canvas 2D smoke rendering, and the native Web Audio API. No animation framework is shipped.

## Deploy

The app is a static Next.js 16 App Router page and can be imported directly into Vercel from GitHub. No runtime environment variables are required.
