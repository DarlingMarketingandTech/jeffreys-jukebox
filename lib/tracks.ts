export type Track = {
  code: string;
  title: string;
  artist: string;
  audio: string;
  source?: "cloudinary" | "drive";
};

const cloudinary = (version: string, name: string) =>
  `https://res.cloudinary.com/dr0xs4iar/video/upload/v${version}/jeffreys-jukebox/audio/${name}.mp3`;

const driveAudio = (fileId: string) => `/api/audio/${fileId}`;

export const tracks: Track[] = [
  // The five recordings that were already live.
  { code: "A1", title: "Back Room Serenade", artist: "Jeffrey Taylor", audio: cloudinary("1784083136", "track-01"), source: "cloudinary" },
  { code: "A2", title: "Last Call Waltz", artist: "Jeffrey Taylor", audio: cloudinary("1784083203", "track-02"), source: "cloudinary" },
  { code: "A3", title: "Neon on Carrollton", artist: "Jeffrey Taylor", audio: cloudinary("1784083226", "track-04"), source: "cloudinary" },
  { code: "A4", title: "Pool Table Moon", artist: "Jeffrey Taylor", audio: cloudinary("1784083259", "track-05"), source: "cloudinary" },
  { code: "A5", title: "Superman (Cover)", artist: "Jeffrey Taylor", audio: cloudinary("1784088627", "superman-cover"), source: "cloudinary" },

  // Jacob's shared Drive archive. Duplicate filenames are intentionally represented once.
  { code: "A6", title: "Got Home", artist: "Jacob Darling", audio: driveAudio("18DUQ7MatOtcnoy527jZwbI6Ti1hfcLIq"), source: "drive" },
  { code: "A7", title: "Vasculitis Blues", artist: "Jacob Darling", audio: driveAudio("14VNV3EED5q1ONKrQtDnuglitYtoEXKOV"), source: "drive" },
  { code: "A8", title: "Cletus Jam", artist: "Jacob Darling", audio: driveAudio("1Q20lPVtGy2eYygy6yLriOAMNXOM_lQp-"), source: "drive" },
  { code: "A9", title: "A Look Back at 38", artist: "Jacob Darling", audio: driveAudio("1Ct36Hv_YWs8nDONAmgH9PoN7lrJRi5K4"), source: "drive" },
  { code: "A10", title: "Drop That Dirty D", artist: "Jacob Darling", audio: driveAudio("1OpG1yluZw_QCKnO91VJD5ZmsbL03wcA2"), source: "drive" },
  { code: "B1", title: "Lil Jam for Clay Clay", artist: "Jacob Darling", audio: driveAudio("1bDeqvoQmfe1eZjtphAFkVTId1m3MvAat"), source: "drive" },
  { code: "B2", title: "Banner Up", artist: "Jacob Darling", audio: driveAudio("1KKaNL13B9rnza5FQ-TInRJpXcnupdSXa"), source: "drive" },
  { code: "B3", title: "83", artist: "Jacob Darling", audio: driveAudio("1giUbum46M4zQZeYGP-G48-502y_5p-0-"), source: "drive" },
  { code: "B4", title: "Unhold On", artist: "Jacob Darling", audio: driveAudio("1jP_vfWaZWX5nAhTN9utJ0e-UD8n6PqNL"), source: "drive" },
  { code: "B5", title: "Pickhole", artist: "Jacob Darling", audio: driveAudio("1w-Ji3J6_vh3oA3MzRYd7kthVeuBTz0Nx"), source: "drive" },
  { code: "B6", title: "Back Home Again in Indiana", artist: "Jacob Darling", audio: driveAudio("1xmWEkjsaOnt2qHMw4DaoxsZ0wueVzBqQ"), source: "drive" },
  { code: "B7", title: "Nobody Knows You When You're Down and Out", artist: "Jacob Darling", audio: driveAudio("13SkpeyMMBb3OpDlw35ycj4rcAcmxAieH"), source: "drive" },
  { code: "B8", title: "Another Way to Look at It", artist: "Jacob Darling", audio: driveAudio("1M9ya9BpD2h4SLnn3xCJe1Fwq8pYH7kIL"), source: "drive" },
  { code: "B9", title: "One Day", artist: "Jacob Darling", audio: driveAudio("1-57KQWRi2l5TeZX4qcfHLO_9TMLg2R1p"), source: "drive" },
  { code: "B10", title: "Heps Dreams", artist: "Jacob Darling", audio: driveAudio("1Gl0SAfOgO3j2VPSMU0S8HcMTSbpzGlbZ"), source: "drive" },
  { code: "C1", title: "Dittle e Douha", artist: "Jacob Darling", audio: driveAudio("12fDeaUHv4KseytqJpL7lpJkK3lZjt5Rx"), source: "drive" },
  { code: "C2", title: "Rain Ditty", artist: "Jacob Darling", audio: driveAudio("1R3KT-h6mqOfZVj6i0gov6ka-C3chRrx6"), source: "drive" },
  { code: "C3", title: "Big Country", artist: "Jacob Darling", audio: driveAudio("1sBy5RSlr2uM4ie1vWfVmeODFNYfJn4Xu"), source: "drive" },
  { code: "C4", title: "Untitled 2024-10-21", artist: "Jacob Darling", audio: driveAudio("1CS5h9bA9F5pMTk--8sVec6_b0t9LZZmW"), source: "drive" },
  { code: "C5", title: "Heps Duet", artist: "Jacob Darling", audio: driveAudio("1tad2tvQ7opXEEgOXicJAgZFkABGpGMak"), source: "drive" },

  // New shared folder added September 2026. Large WAV masters remain in Drive for a later normalization pass.
  { code: "C6", title: "El Don", artist: "Jacob Darling", audio: driveAudio("1jqJi2ijRs5DzwRU_G0KcfaSRYayVAryL"), source: "drive" },
  { code: "C7", title: "Ganja", artist: "Jacob Darling", audio: driveAudio("1P9C8cciPpANtG7226mOrvkQ2F6s3p_CY"), source: "drive" },
  { code: "C8", title: "Nate", artist: "Jacob Darling", audio: driveAudio("1FUhT3UxUPkd_yoFiH7Kuk5IHl123F44T"), source: "drive" },
  { code: "C9", title: "Sweet Water Call", artist: "Jacob Darling", audio: driveAudio("13aE1TH8yWVWfy-kQ9INV81o1ToVsX83k"), source: "drive" },
  { code: "C10", title: "Te Prometo", artist: "Jacob Darling", audio: driveAudio("16jI_rL-mx_k7qxCr6ybSsolDz3ntx90o"), source: "drive" },
  { code: "D1", title: "Bungalow", artist: "Jacob Darling", audio: driveAudio("1VAGPYO0IW8vjgdumaoax0mh8-i0Jq4RL"), source: "drive" },
  { code: "D2", title: "Corazon Y Mente", artist: "Jacob Darling", audio: driveAudio("1X0xp0OiqLH6vGBTyo-zpq5IYeTZY476j"), source: "drive" },
  { code: "D3", title: "Crussin", artist: "Jacob Darling", audio: driveAudio("1k4WANA2Ovi9vVLt4_vU-i0uBZC8T2v_O"), source: "drive" },
  { code: "D4", title: "Dejate Llevar", artist: "Jacob Darling", audio: driveAudio("187h9JkkUGI_9DopU8ESMogy0P22V5kuV"), source: "drive" },
  { code: "D5", title: "Entre Humos", artist: "Jacob Darling", audio: driveAudio("1rQXEQG88ND4vJGroPpWnyxbGzR22sXl-"), source: "drive" },
  { code: "D6", title: "Quejas", artist: "Jacob Darling", audio: driveAudio("1TcKwpglwO2nDQShSbQt_0RoQ_XVNatYz"), source: "drive" },
  { code: "D7", title: "Sin Rencores", artist: "Jacob Darling", audio: driveAudio("1ABuAFK1-yC_lhPL8eSCbIwSKjUtSVwUB"), source: "drive" },
  { code: "D8", title: "Un Dia Mas", artist: "Jacob Darling", audio: driveAudio("1cj5GbrUFxoweMsfKNT0dysBiz4iupi5A"), source: "drive" },
  { code: "D9", title: "Falle", artist: "Jacob Darling", audio: driveAudio("17oMtRRB8F0JJJtjyA3lJcFN7FdrI7gtA"), source: "drive" },
  { code: "D10", title: "Gunster", artist: "Jacob Darling", audio: driveAudio("1-YclbE9YlxShBSmWhIf_m0bvLk6Z3nQH"), source: "drive" },
  { code: "E1", title: "I'm Sorry", artist: "Jacob Darling", audio: driveAudio("1iGL1dPRvE_K9ruViOofFtO_BQKWDn_yU"), source: "drive" },
  { code: "E2", title: "Jardin De Rosas", artist: "Jacob Darling", audio: driveAudio("13ykibN7E1WlPnGP8S1jvqG8rIXOnXifw"), source: "drive" },
  { code: "E3", title: "Los 5", artist: "Jacob Darling", audio: driveAudio("1RbZ3zlSt3qSj3uBNcb7vhJ_MkOv3qucY"), source: "drive" },
  { code: "E4", title: "Me Cuentan", artist: "Jacob Darling", audio: driveAudio("1rrKpMc1AeWrtzxs0yqOI-_5hjMuwRLVg"), source: "drive" },
  { code: "E5", title: "Party", artist: "Jacob Darling", audio: driveAudio("19964w9u7gbiiRwJEHCFYP4hMnlIT9F61"), source: "drive" },
  { code: "E6", title: "Te Perdi", artist: "Jacob Darling", audio: driveAudio("1D62Q2qITUn6uwiFdaqcoKHCiHF3ng0rr"), source: "drive" },
  { code: "E7", title: "Tortas De Jamon", artist: "Jacob Darling", audio: driveAudio("1F11w-Scb1nuhZ8izvW6ishtyKOwMnLFc"), source: "drive" },
  { code: "E8", title: "Noches Enteras", artist: "Jacob Darling", audio: driveAudio("1OfSDD9VisJFZ59PG3cd2s9z6oDq9SFix"), source: "drive" },
  { code: "E9", title: "Sentimientos", artist: "Jacob Darling", audio: driveAudio("1iUl7vqn8u5AnSoU1TM_o3-zzLYYUBCTb"), source: "drive" },
  { code: "E10", title: "Amor Sincero", artist: "Jacob Darling", audio: driveAudio("1FI3jrWk3P4slZfpkOkXgPOPB2E8WcQJZ"), source: "drive" },
  { code: "F1", title: "Amores Perdidos", artist: "Jacob Darling", audio: driveAudio("1pCavabI_ZE5nq9XDXaG7Pod6ofkP0grC"), source: "drive" },
  { code: "F2", title: "F-7", artist: "Jacob Darling", audio: driveAudio("1rZ9rrcsrf-5o5av65xeX45x8rCqWPIiE"), source: "drive" },
];
