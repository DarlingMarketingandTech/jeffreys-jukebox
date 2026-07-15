"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "@/lib/tracks";

type Screen = "landing" | "player";
type Mood = "normal" | "smoke";

type AudioGraph = {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
  dryGain: GainNode;
  wetGain: GainNode;
  lowpass: BiquadFilterNode;
};

const buildImpulseResponse = (context: AudioContext) => {
  const length = Math.floor(context.sampleRate * 1.6);
  const impulse = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const channelData = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      const decay = Math.pow(1 - index / length, 2.8);
      channelData[index] = (Math.random() * 2 - 1) * decay;
    }
  }

  return impulse;
};

export function Jukebox({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioGraphRef = useRef<AudioGraph | null>(null);
  const loaded = useMemo(() => tracks.filter((track) => track.audio), [tracks]);
  const fallbackTrack = loaded[0] ?? tracks[0];

  const [screen, setScreen] = useState<Screen>("landing");
  const [mood, setMood] = useState<Mood>("normal");
  const [selected, setSelected] = useState<Track>(fallbackTrack);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("SELECT A RECORD");
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const ensureAudioGraph = () => {
    if (audioGraphRef.current) {
      return audioGraphRef.current;
    }

    const audio = audioRef.current;
    if (!audio) {
      return null;
    }

    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) {
      setMessage("ADVANCED AUDIO NOT SUPPORTED");
      return null;
    }

    try {
      const context = new AudioContextClass();
      const source = context.createMediaElementSource(audio);
      const dryGain = context.createGain();
      const wetGain = context.createGain();
      const lowpass = context.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 2400;
      lowpass.Q.value = 0.9;

      const convolver = context.createConvolver();
      convolver.buffer = buildImpulseResponse(context);

      source.connect(dryGain);
      dryGain.connect(context.destination);

      source.connect(lowpass);
      lowpass.connect(convolver);
      convolver.connect(wetGain);
      wetGain.connect(context.destination);

      audioGraphRef.current = { context, source, dryGain, wetGain, lowpass };
      return audioGraphRef.current;
    } catch (error) {
      console.error("Failed to initialize audio graph", error);
      setMessage("SMOKE FILTER UNAVAILABLE");
      return null;
    }
  };

  const applyMoodSound = async (nextMood: Mood) => {
    const graph = ensureAudioGraph();
    if (!graph) {
      return;
    }

    if (graph.context.state === "suspended") {
      await graph.context.resume();
    }

    if (nextMood === "smoke") {
      graph.dryGain.gain.value = 0.68;
      graph.wetGain.gain.value = 0.42;
      graph.lowpass.frequency.value = 1850;
      graph.lowpass.Q.value = 1.15;
    } else {
      graph.dryGain.gain.value = 1;
      graph.wetGain.gain.value = 0;
      graph.lowpass.frequency.value = 2400;
      graph.lowpass.Q.value = 0.9;
    }
  };

  useEffect(() => {
    void applyMoodSound(mood);
  }, [mood]);

  const enterPlayer = (nextMood: Mood) => {
    setMood(nextMood);
    setScreen("player");
    setMessage(nextMood === "smoke" ? "SMOKE MODE · PICK A TRACK" : "SELECT A RECORD");
  };

  const playTrack = async (track: Track) => {
    const audio = audioRef.current;

    if (!track.audio) {
      setMessage("RECORD NOT LOADED");
      return;
    }

    if (!audio) {
      setMessage("PLAYER NOT READY");
      return;
    }

    setSelected(track);
    setMessage(`LOADING · ${track.code}`);
    audio.pause();
    audio.src = track.audio;
    audio.load();

    try {
      await applyMoodSound(mood);
      await audio.play();
      setPlaying(true);
      setMessage(`NOW PLAYING · ${track.code}`);
    } catch {
      setPlaying(false);
      setMessage("TAP PLAY TO START");
    }
  };

  const move = (direction: number) => {
    if (!loaded.length) {
      return;
    }

    const index = loaded.findIndex((track) => track.code === selected.code);
    const safeIndex = index < 0 ? 0 : index;
    const next = loaded[(safeIndex + direction + loaded.length) % loaded.length];
    void playTrack(next);
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !selected.audio) {
      return;
    }

    if (audio.paused) {
      if (!audio.src || audio.src !== selected.audio) {
        audio.src = selected.audio;
        audio.load();
      }

      try {
        await applyMoodSound(mood);
        await audio.play();
        setPlaying(true);
        setMessage(`NOW PLAYING · ${selected.code}`);
      } catch {
        setPlaying(false);
        setMessage("AUDIO COULD NOT START");
      }
    } else {
      audio.pause();
      setPlaying(false);
      setMessage(`PAUSED · ${selected.code}`);
    }
  };

  return (
    <main className={`room ${screen === "landing" ? "landing-room" : "player-room"} ${mood === "smoke" ? "mood-smoke" : ""}`}>
      <div className="grain" aria-hidden="true" />

      {screen === "landing" ? (
        <section className="landing-stage" aria-label="Jukebox room opening screen">
          <article className="landing-hero">
            <div className="hero-image-wrap">
              <Image
                src="/images/intro-screen.png"
                alt="Vintage jukebox in a dive-bar room"
                width={1500}
                height={1500}
                priority
                className="hero-image"
              />
            </div>
            <div className="hero-caption">
              <p>DARLING JUKEBOX CO. · ESTABLISHED 1985</p>
              <h1>JEFFREY&apos;S JUKEBOX</h1>
              <small>PRIVATE LISTENING ROOM</small>
            </div>
          </article>

          <aside className="landing-options" aria-label="Opening options">
            <h2>CHOOSE YOUR NIGHT</h2>
            <p>Pick how you want to roll in before stepping up to the machine.</p>
            <button className="primary" onClick={() => enterPlayer("normal")}>
              PLAY SOME TUNES
            </button>
            <button className="accent" onClick={() => enterPlayer("smoke")}>
              SMOKE A JOINT FIRST
            </button>
            <span className="hint">Smoke mode narrows vision and colors the sound.</span>
          </aside>
        </section>
      ) : (
        <section className="machine" aria-label="Jeffrey's Jukebox">
          <header className="marquee">
            <span className="bulb left" aria-hidden="true" />
            <div>
              <p>DARLING JUKEBOX CO.</p>
              <h1>JEFFREY&apos;S JUKEBOX</h1>
              <small>{mood === "smoke" ? "SMOKE MODE ENGAGED" : "ESTABLISHED 1985"}</small>
            </div>
            <span className="bulb right" aria-hidden="true" />
          </header>

          <div className="utility-bar">
            <button onClick={() => setScreen("landing")}>← BACK TO ROOM</button>
            <button
              onClick={() => setMood((current) => (current === "smoke" ? "normal" : "smoke"))}
              className={mood === "smoke" ? "active" : ""}
            >
              {mood === "smoke" ? "SMOKE MODE: ON" : "SMOKE MODE: OFF"}
            </button>
          </div>

          <div className="cabinet">
            <section className="cards" aria-label="Song selections">
              <div className="cards-head">
                <span>SELECT A NUMBER</span>
                <strong>{message}</strong>
              </div>
              <div className="card-grid">
                {tracks.map((track) => (
                  <button
                    key={track.code}
                    className={`song-card ${track.audio ? "loaded" : ""} ${selected.code === track.code ? "selected" : ""}`}
                    onClick={() => void playTrack(track)}
                    aria-label={`${track.code}, ${track.title} by ${track.artist}${track.audio ? ", playable" : ", display only"}`}
                  >
                    <span className="code">{track.code}</span>
                    <span className="copy">
                      <strong>{track.title}</strong>
                      <small>{track.artist}</small>
                    </span>
                    {track.audio && <span className="dot" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </section>

            <section className={`player ${mood === "smoke" ? "smoke-view" : ""}`} aria-label="Music controls">
              <div className="window">
                <div className={`record ${playing ? "spinning" : ""}`} aria-hidden="true">
                  <div className="label">
                    <b>DJ CO.</b>
                    <span>{selected.code}</span>
                    <small>45 RPM</small>
                  </div>
                </div>
                <div className={`arm ${playing ? "down" : ""}`} aria-hidden="true" />
                {mood === "smoke" && <div className="smoke-haze" aria-hidden="true" />}
                {mood === "smoke" && <div className="eye-mask" aria-hidden="true" />}
              </div>

              <div className="now-playing" aria-live="polite">
                <span>{playing ? "NOW PLAYING" : "READY"}</span>
                <h2>{selected.title}</h2>
                <p>{selected.artist}</p>
              </div>

              <audio
                ref={audioRef}
                src={selected.audio}
                preload="metadata"
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => move(1)}
                onError={() => {
                  setPlaying(false);
                  setMessage("AUDIO LOAD ERROR");
                }}
              />

              <div className="controls">
                <button onClick={() => move(-1)} aria-label="Previous loaded record">
                  ◀ PREV
                </button>
                <button className="play" onClick={() => void toggle()} aria-label={playing ? "Pause" : "Play"}>
                  {playing ? "PAUSE" : "PLAY"}
                </button>
                <button onClick={() => move(1)} aria-label="Next loaded record">
                  NEXT ▶
                </button>
              </div>

              <label className="volume">
                VOLUME
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                />
              </label>
              <div className="service">SERVICED BY DARLING JUKEBOX CO. · EST. 1985</div>
            </section>
          </div>
        </section>
      )}
    </main>
  );
}
