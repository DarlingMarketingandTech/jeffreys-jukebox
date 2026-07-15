export type Track = {
  code: string;
  title: string;
  artist: string;
  audio?: string;
};

const drive = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

const loaded: Track[] = [
  { code: "A3", title: "Track One", artist: "Jeffrey Taylor Collection", audio: drive("15JGKEK4M5dZT87v7f-FYazrRtPwbx3Vp") },
  { code: "C7", title: "Track Two", artist: "Jeffrey Taylor Collection", audio: drive("16b88zW6OV1eyYL9OZve8jfE9aR52LVEX") },
  { code: "F2", title: "Track Four", artist: "Jeffrey Taylor Collection", audio: drive("1DZWspwl8_fp2ZniuEslPLK0kL6jphMUh") },
  { code: "H8", title: "Track Five", artist: "Jeffrey Taylor Collection", audio: drive("1nHfdTTegE17QEtlAf6NDq7pwjI4qi-1y") },
  { code: "L4", title: "Superman (Cover)", artist: "Recovered Recording", audio: drive("1V7SkBHRe8h2KddRCiQ6Fdl9zpcQW1BzU") },
];

const names = [
  ["Closing Time Again", "The Ashtray Saints"], ["Two Beers Past Midnight", "Walt Mercer"],
  ["Blue Collar Moon", "The County Lines"], ["Last Call Lullaby", "June Bell"],
  ["Neon Over Main Street", "The Turnarounds"], ["Quarter in the Machine", "Eddie Vale"],
  ["Old Route Home", "The Mile Markers"], ["Tavern Window Rain", "Martha Grey"],
  ["Friday Night Regular", "The House Band"], ["Cigarette Sunrise", "Cal Porter"],
  ["One More for the Road", "The Brass Rails"], ["Pool Table Promises", "Ginny Cole"],
  ["Whiskey on the Jukebox", "The Night Owls"], ["Back Booth Heartache", "Roy Daniels"],
  ["Small Town Static", "The AM Kings"], ["Chrome and Walnut", "Betty Lane"],
  ["Barstool Philosophy", "The Long Pours"], ["Sunday Morning Tab", "Hank Avery"],
  ["Dime Store Halo", "Rosie Dean"], ["The Door Swings Both Ways", "The Late Shifts"],
  ["Amber Light Serenade", "Johnny West"], ["Corner Booth Confidential", "The Low Notes"],
  ["Three Songs Till Closing", "Maggie Ford"], ["Rust on the Sign", "The Old Roads"],
  ["Dance Floor Dust", "Ruby Carson"], ["The Regular's Waltz", "Milo Grant"],
  ["Cash Only Tonight", "The Loose Change"], ["Rain on the Beer Sign", "Nora James"],
  ["Another Saturday Gone", "The Side Streets"], ["Bent Eight Ball", "Charlie Knox"],
  ["Warm Glass, Cold Night", "The Last Rounds"], ["Meet Me by the Machine", "Lola Hart"],
  ["Half a Song Too Late", "The Closing Crew"], ["Nickel-Plated Memory", "Sam Rivers"],
  ["House Lights Low", "The After Hours"], ["Goodnight, Bartender", "Ella Boone"]
];

const decorative: Track[] = names.map(([title, artist], index) => ({
  code: `${String.fromCharCode(65 + Math.floor(index / 8))}${(index % 8) + 1}`,
  title,
  artist,
}));

const byCode = new Map(loaded.map((track) => [track.code, track]));
export const tracks = decorative.map((track) => byCode.get(track.code) ?? track).concat(
  loaded.filter((track) => !decorative.some((item) => item.code === track.code))
).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
