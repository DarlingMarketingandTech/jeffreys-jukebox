# Initial Improvement Notes - Jeffrey's Jukebox

Last reviewed: 2026-09-10

These notes capture low-hanging fruit and first-phase improvement candidates found while reviewing the repo, Vercel project, and supplied Drive audio folder. They are intentionally scoped for the app-improvement phase after the review/handoff documentation is accepted.

## Current state summary

- The app is a Next.js 16 / React 19 / TypeScript jukebox experience deployed on Vercel.
- The current production deployment is `READY` on Vercel.
- The Vercel project is linked to GitHub repo `DarlingMarketingandTech/jeffreys-jukebox`.
- The app has no required runtime environment variables noted in the README.
- The live app currently uses Cloudinary-hosted MP3s configured in `lib/tracks.ts`.
- The supplied Google Drive folder is a larger raw/staging library of audio files and duplicates, not yet a normalized production catalog.

## Highest-priority low-hanging fruit

### 1. Bring `README.md` back in sync with the current code

The README still describes features that appear to belong to an earlier, fuller room/mood version: smoke/haze, lighter, side room views, coaster interactions, ember behavior, `MoodProvider`, `HazeLighter`, and other components. The latest Vercel production deployment commit says the app moved to a photo-based single-scene intro and removed pool room, signed wall, step-outside/alley, About panel, coaster, mood context, haze-related pieces, and muffled audio graph behavior.

Action:

- Rewrite the README around the current app shape.
- Preserve the original concept notes only if moved into a `docs/archive/` or `docs/roadmap/` section.
- Keep the smoke-test checklist, but update it to match actual current functionality.

Why it matters:

- Future agents will otherwise chase missing components or reintroduce deleted features accidentally.
- The README is currently less reliable than `components/jukebox.tsx`, `hooks/useJukeboxAudio.ts`, and the latest Vercel commit metadata.

### 2. Add explicit quality scripts

`package.json` currently has only:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

Action:

- Add a `typecheck` script: `tsc --noEmit`.
- Add a `check` script that runs typecheck and build.
- Consider adding lint tooling only after confirming the Next.js 16 preferred path for this project.

Suggested scripts:

```json
{
  "typecheck": "tsc --noEmit",
  "check": "npm run typecheck && npm run build"
}
```

Why it matters:

- Agents need a fast, consistent way to validate changes before opening PRs.
- Build alone may not be the clearest signal for type-only regressions.

### 3. Audit image assets and optimize the large intro image

Observed image folder notes:

- `public/images/intro-screen.png` is about 2.48 MB.
- `alley-cat-bar.webp` and `alley-cat-signed-wall.webp` share the same blob SHA.
- `alley-cat-exterior.webp` and `alley-cat-graffiti-alley.webp` share the same blob SHA.
- Some older scene assets may now be unused after the latest single-scene refactor.

Action:

- Confirm which images are referenced by the current app.
- Convert or replace the large intro PNG with optimized WebP/AVIF variants if visual quality holds.
- Remove unused image assets only after confirming they are not intentionally retained for a roadmap branch.
- Add a small asset manifest in `docs/` if the project will keep historical/roadmap images.

Why it matters:

- Faster first load on mobile.
- Fewer broken assumptions for future agents.
- Lower repo noise.

### 4. Create a real audio catalog from the Drive folder

The Drive folder contains many raw songs, duplicates, alternate takes, masters, and file formats. The current app only ships five Cloudinary MP3s.

Action:

- Create a `docs/audio-catalog.md` or spreadsheet with columns:
  - title
  - Drive file id
  - original filename
  - format
  - size
  - modified time
  - duplicate group
  - quality/listening notes
  - candidate status
  - final jukebox code
  - final delivery URL
- Dedupe obvious duplicates first, such as repeated `WAITIN FOR SUPERMAN`, `good good time`, `pretty Bird 2`, `boss of suova`, and `minutarettes outro` variants.
- Decide whether the app should remain Jeffrey-only, become Jacob/Jeffrey mixed, or become a broader personal music archive.

Why it matters:

- The audio source library is larger than the current app model.
- Without catalog discipline, future updates will confuse demos, masters, covers, and duplicates.

### 5. Resolve the missing `track-03` Cloudinary note

`lib/tracks.ts` says `track-03` is missing from Cloudinary and maps F2 to `track-04`.

Action:

- Decide whether this is acceptable historical documentation or an unresolved asset gap.
- If unresolved, locate the intended track, upload a stable MP3, and update `lib/tracks.ts`.
- Keep track codes stable if users already know the five loaded selections.

Why it matters:

- It may represent a missing recovered recording.
- It is a simple first audio-integrity fix.

## Next useful improvements after low-hanging fruit

### 6. Improve metadata and sharing previews

Current `app/layout.tsx` has a basic title and description. It does not appear to define Open Graph/Twitter card metadata or a social preview image.

Action:

- Add Open Graph metadata.
- Create or generate a dedicated OG image from the jukebox/room visual.
- Confirm the shared link preview for the Vercel URL.

### 7. Add a tiny browser verification checklist for agents

The README has a long smoke test, but future agents need a shorter must-pass path.

Action:

- Add `docs/qa-smoke-test.md` with a 2-minute and 5-minute version.
- Include desktop and mobile viewport checks.
- Include one playback check and one decorative-track rejection check.

### 8. Split giant CSS only when it creates real friction

`app/globals.css` is doing almost all visual work. That is fine for a highly art-directed one-page app, but it is easy for agents to break.

Action:

- Add section comments and a CSS table of contents first.
- Only split CSS into modules or component CSS after there is a concrete editing need.
- Avoid a full styling rewrite unless the visual direction changes.

### 9. Decide whether removed features are archived or coming back

Vercel history shows earlier layers included smoke, room modes, coaster, side views, and an Alley Cat mood engine, but the latest production direction removed many of those pieces.

Action:

- Make a product decision doc:
  - current single-scene machine = canonical
  - older room/mood features = archived
  - older room/mood features = future roadmap
- If roadmap, define one feature at a time rather than resurrecting everything.

### 10. Add a lightweight contribution workflow

Action:

- Keep future changes on branches.
- Use small PRs for documentation, asset optimization, audio mapping, UI behavior, and deployment settings separately.
- Require `npm run build` before merge.
- Add PR checklist items for mobile layout, playback, and decorative record rejection.

## Suggested first improvement phase sequence

1. README sync.
2. Add `typecheck` / `check` scripts.
3. Create `docs/audio-catalog.md` from the Drive folder.
4. Audit image usage and optimize `intro-screen.png`.
5. Resolve or document missing `track-03`.
6. Add OG metadata and preview image.
7. Add short QA smoke test doc.

## Do not do yet

- Do not replace the Cloudinary audio delivery layer until the final audio catalog is selected.
- Do not migrate to a database before the project needs user accounts, saved favorites, analytics, or a real admin workflow.
- Do not add a heavy animation library just for the current camera and cabinet motion.
- Do not reintroduce smoke/coaster/side-room features until the product direction is clarified.
- Do not remove old image assets without checking whether they are needed for a planned restoration or archived reference.
