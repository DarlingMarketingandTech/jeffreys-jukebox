export type TrackBucket = "featured" | "archive" | "raw";
export type TrackKind = "original" | "cover" | "jam" | "duet";
export type TrackArtist = "Jacob Darling" | "Jeffrey Taylor";

export type Track = {
  code: string;
  title: string;
  artist: TrackArtist;
  audio: string;
  source: "cloudinary" | "drive";
  bucket: TrackBucket;
  kind: TrackKind;
  artwork: string;
};

const cloudinary = (version: string, name: string) =>
  `https://res.cloudinary.com/dr0xs4iar/video/upload/v${version}/jeffreys-jukebox/audio/${name}.mp3`;

const driveAudio = (fileId: string) => `/api/audio/${fileId}`;

// J&J launch catalog: 5 existing Jeffrey recordings + Jacob's 12 selected cuts.
// Personal recording notes intentionally stay out of this public source file.
// The private backend will own shared comments and other private metadata.
export const tracks: Track[] = [
  { code: "A1", title: "Back Room Serenade", artist: "Jeffrey Taylor", audio: cloudinary("1784083136", "track-01"), source: "cloudinary", bucket: "featured", kind: "original", artwork: "afterglow" },
  { code: "A2", title: "Last Call Waltz", artist: "Jeffrey Taylor", audio: cloudinary("1784083203", "track-02"), source: "cloudinary", bucket: "featured", kind: "original", artwork: "last-call" },
  { code: "A3", title: "Neon on Carrollton", artist: "Jeffrey Taylor", audio: cloudinary("1784083226", "track-04"), source: "cloudinary", bucket: "featured", kind: "original", artwork: "neon-sign" },
  { code: "A4", title: "Pool Table Moon", artist: "Jeffrey Taylor", audio: cloudinary("1784083259", "track-05"), source: "cloudinary", bucket: "archive", kind: "original", artwork: "pool-felt" },
  { code: "A5", title: "Superman (Cover)", artist: "Jeffrey Taylor", audio: cloudinary("1784088627", "superman-cover"), source: "cloudinary", bucket: "archive", kind: "cover", artwork: "blue-hour" },

  { code: "B1", title: "Display Pie", artist: "Jacob Darling", audio: driveAudio("12deWIkLX4brCEVPbBmo2A653Ox6jpiBr"), source: "drive", bucket: "featured", kind: "original", artwork: "psychedelic-print" },
  { code: "B2", title: "Scotty Jams", artist: "Jacob Darling", audio: driveAudio("187uJ8C81ATP5tAk7uJ-W8u1GwnWFd1hb"), source: "drive", bucket: "raw", kind: "jam", artwork: "rehearsal-tape" },
  { code: "B3", title: "Hep's Duet", artist: "Jacob Darling", audio: driveAudio("19lfoRir6rKPbomqXVHa70i9ICCeMx5gr"), source: "drive", bucket: "raw", kind: "duet", artwork: "polaroid" },
  { code: "B4", title: "Waitin' for a Superman", artist: "Jacob Darling", audio: driveAudio("1XzHldr8s4lIhcLhjFxmi0s8NVcoHX3ry"), source: "drive", bucket: "featured", kind: "cover", artwork: "night-sky" },
  { code: "B5", title: "Hep's Dreams", artist: "Jacob Darling", audio: driveAudio("1Osd2L2eDVVPuzsOM7phe6kWEc3dzBunR"), source: "drive", bucket: "featured", kind: "original", artwork: "sleeping-dog" },
  { code: "B6", title: "Back Home Again in Indiana", artist: "Jacob Darling", audio: driveAudio("1qJlGVzt_jl7uXMS0V8TrDfsXtf6vMSbh"), source: "drive", bucket: "archive", kind: "cover", artwork: "indiana-road" },
  { code: "B7", title: "Big Country", artist: "Jacob Darling", audio: driveAudio("1VhXQfAWVtew8CNCKC3Cx0XBAgQBnw_Ef"), source: "drive", bucket: "featured", kind: "cover", artwork: "open-road" },
  { code: "B8", title: "Cletus Jam", artist: "Jacob Darling", audio: driveAudio("1Acsf5ipIODgUz9KzPlYpUFCJKeEb_ZLr"), source: "drive", bucket: "raw", kind: "jam", artwork: "cassette" },
  { code: "B9", title: "Good Good Time", artist: "Jacob Darling", audio: driveAudio("1gQKDiQ10C4yTgIi1eHwUa-hLsDzQMZhP"), source: "drive", bucket: "featured", kind: "original", artwork: "office-tape" },
  { code: "B10", title: "Dublin Blues", artist: "Jacob Darling", audio: driveAudio("104HrnNIkD8m8qVYgemHqRISYfKqonTIh"), source: "drive", bucket: "featured", kind: "cover", artwork: "bar-napkin" },
  { code: "C1", title: "Nobody Knows You When You're Down and Out", artist: "Jacob Darling", audio: driveAudio("1VSgsM30golzvmELumNF1fhw0NurMo5Aa"), source: "drive", bucket: "archive", kind: "cover", artwork: "worn-45" },
  { code: "C2", title: "A Look Back at 38", artist: "Jacob Darling", audio: driveAudio("1ckBphfXQIPrWWyGp_dLlCNGq85qhogpc"), source: "drive", bucket: "featured", kind: "original", artwork: "birthday-polaroid" },
];

export const trackCounts = {
  total: tracks.length,
  featured: tracks.filter((track) => track.bucket === "featured").length,
  archive: tracks.filter((track) => track.bucket === "archive").length,
  raw: tracks.filter((track) => track.bucket === "raw").length,
};
