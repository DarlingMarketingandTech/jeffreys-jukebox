export type Track = {
  code: string;
  title: string;
  artist: string;
  audio?: string;
};

const cloudinary = (version: string, name: string) =>
  `https://res.cloudinary.com/dr0xs4iar/video/upload/v${version}/jeffreys-jukebox/audio/${name}.mp3`;

// Note: track-03 is missing from Cloudinary — F2 uses track-04
const loaded: Track[] = [
  { code: "A3", title: "Back Room Serenade", artist: "Jeffrey Taylor", audio: cloudinary("1784083136", "track-01") },
  { code: "C7", title: "Last Call Waltz", artist: "Jeffrey Taylor", audio: cloudinary("1784083203", "track-02") },
  { code: "F2", title: "Neon on Carrollton", artist: "Jeffrey Taylor", audio: cloudinary("1784083226", "track-04") },
  { code: "H8", title: "Pool Table Moon", artist: "Jeffrey Taylor", audio: cloudinary("1784083259", "track-05") },
  { code: "L4", title: "Superman (Cover)", artist: "Jeffrey Taylor", audio: cloudinary("1784088627", "superman-cover") },
];

const titleStarts = [
  "Closing Time", "Two Beers", "Blue Collar", "Last Call", "Neon", "Quarter in the Machine",
  "Old Route", "Tavern Window", "Friday Night", "Cigarette Sunrise", "One More", "Pool Table",
  "Whiskey", "Back Booth", "Small Town", "Chrome and Walnut", "Barstool", "Sunday Morning",
  "Dime Store", "Corner Booth",
];

const titleEnds = [
  "Again", "Past Midnight", "Moon", "Lullaby", "Over Main Street", "Home", "Rain", "Regular",
  "for the Road", "Promises", "Heartache", "Static", "Philosophy", "Tab", "Halo", "Confidential",
  "Till Closing", "on the Sign", "Dust", "Waltz",
];

const artistStarts = [
  "The Ashtray", "Walt Mercer & the", "The County", "June Bell & the", "The Turnaround", "Eddie Vale's",
  "The Mile Marker", "Martha Grey & the", "The House", "Cal Porter's", "The Brass", "Ginny Cole & the",
  "Broad Ripple", "Carrollton Ave", "The Back Booth", "Meridian Line", "The Alley Cat",
];

const artistEnds = [
  "Saints", "Night Owls", "Lines", "Late Shifts", "Kings", "Loose Change", "Old Roads", "Side Streets",
  "Last Rounds", "Low Notes", "Regulars", "Closing Crew",
];

const decorative: Track[] = Array.from({ length: 120 }, (_, index) => {
  const letterIndex = Math.floor(index / 10);
  const number = (index % 10) + 1;
  return {
    code: `${String.fromCharCode(65 + letterIndex)}${number}`,
    title: `${titleStarts[index % titleStarts.length]} ${titleEnds[(index * 7) % titleEnds.length]}`,
    artist: `${artistStarts[(index * 5) % artistStarts.length]} ${artistEnds[(index * 7) % artistEnds.length]}`,
  };
});

const byCode = new Map(loaded.map((track) => [track.code, track]));

export const tracks = decorative.map((track) => byCode.get(track.code) ?? track);
