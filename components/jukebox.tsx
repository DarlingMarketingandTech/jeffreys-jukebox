"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "@/lib/tracks";

type Mood = "clear" | "hazy";
type LookDirection = "left" | "center" | "right";
type Mechanism = "idle" | "selecting" | "playing" | "paused" | "rejected";

type AudioGraph = {
  context: AudioContext;
  dryGain: GainNode;
  wetGain: GainNode;
  lowpass: BiquadFilterNode;
};

const pageLetters = "ABCDEFGHIJKL".split("");

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function buildImpulseResponse(context: AudioContext) {
  const length = Math.floor(context.sampleRate * 1.35);
  const impulse = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 3.2);
    }
  }

  return impulse;
}

export function Jukebox({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioGraphRef = useRef<AudioGraph | null>(null);
  const loaded = useMemo(() => tracks.filter((track) => track.audio), [tracks]);

  const [approached, setApproached] = useState(false);
  const [mood, setMood] = useState<Mood>("clear");
  const [look, setLook] = useState<LookDirection>("center");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Track>(loaded[0] ?? tracks[0]);
  const [playing, setPlaying] = useState(false);
  const [mechanism, setMechanism] = useState<Mechanism>("idle");
  const [message, setMessage] = useState("PICK A TITLE · THEN PRESS PLAY");
  const [volume, setVolume] = useState(0.82);

  const leftLetter = pageLetters[page];
  const rightLetter = pageLetters[page + 1];
  const visibleTracks = tracks.filter((track) =>
    track.code.startsWith(leftLetter) || (rightLetter ? track.code.startsWith(rightLetter) : false),
  );

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function ensureAudioGraph() {
    if (audioGraphRef.current) return audioGraphRef.current;
    const audio = audioRef.current;
    if (!audio) return null;

    try {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const dryGain = context.createGain();
      const wetGain = context.createGain();
      const lowpass = context.createBiquadFilter();
      const convolver = context.createConvolver();

      lowpass.type = "lowpass";
      convolver.buffer = buildImpulseResponse(context);
      source.connect(dryGain).connect(context.destination);
      source.connect(lowpass).connect(convolver).connect(wetGain).connect(context.destination);

      audioGraphRef.current = { context, dryGain, wetGain, lowpass };
      return audioGraphRef.current;
    } catch {
      return null;
    }
  }

  async function applyMoodSound(nextMood: Mood) {
    const graph = ensureAudioGraph();
    if (!graph) return;
    if (graph.context.state === "suspended") await graph.context.resume();

    graph.dryGain.gain.setTargetAtTime(nextMood === "hazy" ? 0.74 : 1, graph.context.currentTime, 0.08);
    graph.wetGain.gain.setTargetAtTime(nextMood === "hazy" ? 0.3 : 0, graph.context.currentTime, 0.08);
    graph.lowpass.frequency.setTargetAtTime(nextMood === "hazy" ? 2150 : 5200, graph.context.currentTime, 0.08);
  }

  async function toggleMood() {
    const nextMood = mood === "clear" ? "hazy" : "clear";
    setMood(nextMood);
    await applyMoodSound(nextMood);
  }

  function chooseTrack(track: Track) {
    setSelected(track);
    setMessage(track.audio ? `${track.code} SELECTED · PRESS PLAY` : `${track.code} · DISPLAY RECORD`);
    setMechanism("idle");
  }

  async function startSelected() {
    const audio = audioRef.current;
    if (!audio || !selected.audio) {
      setMechanism("rejected");
      setMessage("SORRY PAL · THAT RECORD ISN'T LOADED");
      await wait(850);
      setMechanism("idle");
      return;
    }

    if (audio.src !== selected.audio) {
      audio.pause();
      audio.src = selected.audio;
      audio.load();
    }

    setMechanism("selecting");
    setMessage(`PULLING ${selected.code} FROM THE RACK…`);

    try {
      await applyMoodSound(mood);
      await audio.play();
      setPlaying(true);
      await wait(720);
      setMechanism("playing");
      setMessage(`NOW PLAYING · ${selected.code}`);
    } catch {
      setPlaying(false);
      setMechanism("idle");
      setMessage("TAP PLAY AGAIN TO START");
    }
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !selected.audio || audio.src !== selected.audio) {
      await startSelected();
      return;
    }

    if (audio.paused) {
      try {
        await applyMoodSound(mood);
        await audio.play();
        setPlaying(true);
        setMechanism("playing");
        setMessage(`NOW PLAYING · ${selected.code}`);
      } catch {
        setMessage("TAP PLAY AGAIN TO START");
      }
    } else {
      audio.pause();
      setPlaying(false);
      setMechanism("paused");
      setMessage(`PAUSED · ${selected.code}`);
    }
  }

  async function moveLoaded(direction: number) {
    const index = loaded.findIndex((track) => track.code === selected.code);
    const next = loaded[(Math.max(index, 0) + direction + loaded.length) % loaded.length];
    setSelected(next);
    setPage(Math.floor(pageLetters.indexOf(next.code[0]) / 2) * 2);
    await wait(20);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = next.audio ?? "";
      audio.load();
      try {
        await applyMoodSound(mood);
        await audio.play();
        setMechanism("selecting");
        setMessage(`PULLING ${next.code} FROM THE RACK…`);
        await wait(720);
        setMechanism("playing");
        setMessage(`NOW PLAYING · ${next.code}`);
      } catch {
        setMessage(`${next.code} SELECTED · PRESS PLAY`);
      }
    }
  }

  function turnPage(direction: number) {
    setPage((current) => Math.min(10, Math.max(0, current + direction * 2)));
    setMessage("TITLE PAGES TURNED");
  }

  return (
    <main className={`bar-room look-${look} ${approached ? "approached" : "standing-back"} mood-${mood}`}>
      <div className="scene-backdrop" aria-hidden="true">
        <Image src="/images/intro-screen.png" alt="" fill priority sizes="100vw" />
      </div>
      <div className="room-shade" aria-hidden="true" />
      <div className="room-grain" aria-hidden="true" />
      {mood === "hazy" && <div className="room-haze" aria-hidden="true"><i /><i /><i /></div>}

      <header className="room-sign">
        <span>THE ALLEY CAT · BACK ROOM</span>
        <strong>JEFFREY&apos;S JUKEBOX</strong>
        <small>PRIVATE LISTENING ROOM · NO COVER · NO NONSENSE</small>
      </header>

      {!approached && (
        <section className="welcome-card" aria-label="Enter Jeffrey's listening room">
          <p className="eyebrow">JEFFREY TAYLOR&apos;S TABLE IS READY</p>
          <h1>Pull up a stool.<br />Your songs are in the box.</h1>
          <p>The old machine has a few of your recordings tucked between 115 barroom classics.</p>
          <button className="step-up" onClick={() => setApproached(true)}>STEP UP TO THE JUKEBOX</button>
          <small>Built by Darling Juke Joint Works · Indiana · Model JT-85</small>
        </section>
      )}

      <nav className="look-controls" aria-label="Look around the bar">
        <button onClick={() => setLook("left")} className={look === "left" ? "active" : ""}>← LOOK LEFT</button>
        <button onClick={() => setLook("center")} className={look === "center" ? "active" : ""}>THE JUKEBOX</button>
        <button onClick={() => setLook("right")} className={look === "right" ? "active" : ""}>LOOK RIGHT →</button>
      </nav>

      {look !== "center" && (
        <aside className={`bar-story story-${look}`} aria-live="polite">
          <span>{look === "left" ? "AT THE BAR" : "ON THE WALL"}</span>
          <p>{look === "left" ? "A crooked eight-ball, two mystery keys, and a jar marked “retirement fund.” Nobody knows whose retirement." : "Forty years of initials, bad poetry, and one warning: DON’T PLAY FREE BIRD BEFORE CLOSING."}</p>
          <button onClick={() => setLook("center")}>BACK TO THE MUSIC</button>
        </aside>
      )}

      <section className="jukebox-zone" aria-label="Darling Juke Joint Works jukebox">
        <div className={`cabinet mechanism-${mechanism}`}>
          <div className="cabinet-glow" aria-hidden="true" />
          <header className="machine-marquee">
            <span className="marquee-note">♪</span>
            <div><small>DARLING JUKE JOINT WORKS</small><h2>JEFFREY&apos;S</h2><b>JUKEBOX</b></div>
            <span className="marquee-note">♫</span>
          </header>

          <div className="machine-body">
            <section className="catalog" aria-label="Song title catalog">
              <div className="catalog-topline"><span>10¢ PER PLAY</span><strong>{message}</strong><span>120 SELECTIONS</span></div>
              <div className="title-book" key={page}>
                {[leftLetter, rightLetter].filter(Boolean).map((letter) => (
                  <div className="title-page" key={letter}>
                    <div className="page-tab">PAGE {letter}</div>
                    {visibleTracks.filter((track) => track.code.startsWith(letter)).map((track) => (
                      <button key={track.code} className={`title-strip ${selected.code === track.code ? "selected" : ""} ${track.audio ? "jeffrey-cut" : ""}`} onClick={() => chooseTrack(track)}>
                        <span className="selection-code">{track.code}</span>
                        <span className="title-copy"><strong>{track.title}</strong><small>{track.artist}</small></span>
                        {track.audio && <span className="loaded-mark" title="Jeffrey's recording">JT</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <div className="page-controls">
                <button onClick={() => turnPage(-1)} disabled={page === 0}>◀ FLIP BACK</button>
                <span>{leftLetter}1–{leftLetter}10 · {rightLetter}1–{rightLetter}10</span>
                <button onClick={() => turnPage(1)} disabled={page >= 10}>FLIP AHEAD ▶</button>
              </div>
            </section>

            <section className="mechanism-window" aria-label="Visible record mechanism">
              <div className="record-stack" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <div className={`vinyl ${playing ? "spinning" : ""}`} aria-hidden="true"><div><small>DJJW</small><strong>{selected.code}</strong><span>45 RPM</span></div></div>
              <div className="selector-arm" aria-hidden="true"><span /></div>
              <div className="needle-arm" aria-hidden="true" />
              <div className="mechanism-caption">AUTOMATIC RECORD CHANGER · MODEL JT-85</div>
            </section>

            <section className="control-deck" aria-label="Playback controls">
              <div className="now-playing" aria-live="polite"><span>{playing ? "NOW PLAYING" : "SELECTED"}</span><strong>{selected.code} · {selected.title}</strong><small>{selected.artist}</small></div>
              <div className="transport">
                <button onClick={() => void moveLoaded(-1)} aria-label="Previous Jeffrey recording">◀</button>
                <button className="play-button" onClick={() => void togglePlayback()}>{playing ? "PAUSE" : `PLAY ${selected.code}`}</button>
                <button onClick={() => void moveLoaded(1)} aria-label="Next Jeffrey recording">▶</button>
              </div>
              <label className="volume-control"><span>VOLUME</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
              <button className={`smoke-switch ${mood === "hazy" ? "lit" : ""}`} onClick={() => void toggleMood()}>{mood === "hazy" ? "CLEAR THE AIR" : "LIGHT ONE UP"}</button>
            </section>
          </div>

          <footer className="maker-plate"><b>DARLING JUKE JOINT WORKS</b><span>HAND-BUILT IN INDIANA · EST. 1985</span><small>SERIAL NO. JEFF-TAYLOR-001</small></footer>
        </div>
      </section>

      {approached && <button className="step-back" onClick={() => setApproached(false)}>← BACK TO YOUR STOOL</button>}
      <div className="smoke-status" aria-live="polite">{mood === "hazy" ? "THE WHOLE ROOM IS GETTING A LITTLE HAZY" : "AIR: MOSTLY CLEAR"}</div>

      <audio ref={audioRef} src={selected.audio} crossOrigin="anonymous" preload="metadata" playsInline onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => void moveLoaded(1)} onError={() => { setPlaying(false); setMechanism("idle"); setMessage("THE RECORD SKIPPED · TRY AGAIN"); }} />
    </main>
  );
}
