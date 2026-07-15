# Jeffrey's Jukebox

A custom, installable jukebox for Jeffrey Taylor, built under the fictional **Darling Jukebox Co. · Established 1985** brand.

## What is included

- Five recovered recordings, converted to browser-friendly MP3 and lightly cleaned/volume-leveled.
- 96 vintage jukebox title cards so the cabinet feels fully stocked.
- Amber dots identify the five records that are actually loaded.
- Previous and Next move only between the loaded records.
- Decorative cards respond with `RECORD NOT LOADED` instead of appearing broken.
- Installable Progressive Web App with offline audio caching.
- Large controls, strong contrast, keyboard focus states, and reduced-motion support.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Create a new GitHub repository and copy this project into it.
2. Commit and push.
3. Import the repository at Vercel.
4. Accept the detected Next.js settings and deploy.

The `source-audio` directory is intentionally excluded from Git and Vercel. The cleaned playback files are in `public/audio`.

## Rename the recovered tracks

Edit the five real entries near the top of `lib/tracks.ts`:

- `A3` → Track One
- `C7` → Track Two
- `F2` → Track Four
- `H8` → Track Five
- `L4` → Superman (Cover)

Change only the `title` and `artist` values. The audio path and cabinet behavior can stay untouched.

## Install on Jeffrey's phone

### Android / Chrome

1. Open the deployed URL.
2. Tap **PUT ON PHONE**, or open Chrome's menu.
3. Choose **Install app** or **Add to Home screen**.

### iPhone / Safari

1. Open the deployed URL in Safari.
2. Tap Share.
3. Choose **Add to Home Screen**.

Open the app once while online so all five records can be cached for offline playback.

## Audio note

The originals are preserved separately. The playback copies received mild noise reduction where appropriate, low/high frequency cleanup, and loudness normalization. Because the actual song identities are not embedded in four files, the interface uses honest placeholder titles rather than guessing.
