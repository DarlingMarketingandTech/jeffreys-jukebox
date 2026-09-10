# Jeffrey's Jukebox — QA Smoke Test

Use this before merging interaction, catalog, audio-delivery, or visual changes.

## 2-minute gate

1. Open the Vercel preview at desktop width.
2. Confirm the room image appears and `WALK UP & PICK A REAL RECORDING` is clickable.
3. Walk up. Confirm the catalog reports the real-cut count and contains no generated filler titles.
4. Play `A1 · Back Room Serenade`; verify audio, spinning record, VU meter, and room aura.
5. Play one Drive-backed track such as `A6 · Got Home`; verify it begins without navigating away from the app.
6. Use previous/next once in each direction.
7. Click the persistent progress strip and confirm playback seeks.
8. Run `npm run check` or verify the equivalent CI check is green.

## 5-minute gate

Complete the 2-minute gate, then:

### Audio delivery

- Play one original Cloudinary recording.
- Play one Drive-backed recording from the existing archive.
- Play one Drive-backed recording from the September 2026 additions.
- Seek into the middle of a Drive-backed track and verify playback resumes near the requested point.
- Let a track finish or use next; verify advancement stays within the real catalog.
- Confirm pause/resume works from both cabinet and persistent dock.

### Catalog

- Turn through every available page pair.
- Confirm the Next button disables at the actual final real page.
- Confirm every visible title card represents a real catalog entry from `lib/tracks.ts`.
- Confirm no fake artists, fake song titles, or intentional rejection slots remain.

### Interaction

With focus outside controls:

- `Space` toggles pause/resume.
- `←` selects/plays the previous real track.
- `→` selects/plays the next real track.
- `Esc` steps back from the machine.

On the progress control:

- `←` seeks back about 10 seconds.
- `→` seeks forward about 10 seconds.

### Visual response

- VU bars respond to actual audio.
- Ambient spectrum/glow responds without blocking controls.
- Pausing audio settles the reactive visuals.
- Pointer parallax and cabinet tilt do not cause text/control jitter.

### Responsive/accessibility

- Test approximately 390px mobile width and a desktop viewport.
- No essential control is clipped by safe areas or the persistent dock.
- Title buttons remain readable/tappable.
- Visible focus states remain present.
- With `prefers-reduced-motion: reduce`, the experience stays usable and the ambient spectrum is not required for state communication.

### Metadata/device behavior

- Browser/OS Media Session shows the active title and artist where supported.
- Remote Playback control appears only where the browser reports support.
- Sharing the preview/page produces the updated Jeffrey's Jukebox metadata rather than stale copy.

## Merge rule

Do not merge when Vercel or CI is red, when a Drive-backed track cannot stream, or when the catalog has reverted to generated filler titles.
