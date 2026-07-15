"use client";

import { useMemo, useRef, useState } from "react";
import type { Track } from "@/lib/tracks";

export function Jukebox({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const loaded = useMemo(() => tracks.filter((track) => track.audio), [tracks]);
  const [selected, setSelected] = useState<Track>(loaded[0]);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("SELECT A RECORD");

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
      await audio.play();
      setPlaying(true);
      setMessage(`NOW PLAYING · ${track.code}`);
    } catch {
      setPlaying(false);
      setMessage("TAP PLAY TO START");
    }
  };

  const move = (direction: number) => {
    const index = loaded.findIndex((track) => track.code === selected.code);
    const next = loaded[(index + direction + loaded.length) % loaded.length];
    void playTrack(next);
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !selected.audio) return;

    if (audio.paused) {
      if (!audio.src || audio.src !== selected.audio) {
        audio.src = selected.audio;
        audio.load();
      }

      try {
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
    <main className="room">
      <div className="grain" aria-hidden="true" />
      <section className="machine" aria-label="Jeffrey's Jukebox">
        <header className="marquee">
          <span className="bulb left" aria-hidden="true" />
          <div>
            <p>DARLING JUKEBOX CO.</p>
            <h1>JEFFREY'S JUKEBOX</h1>
            <small>ESTABLISHED 1985</small>
          </div>
          <span className="bulb right" aria-hidden="true" />
        </header>

        <div className="cabinet">
          <section className="cards" aria-label="Song selections">
            <div className="cards-head"><span>SELECT A NUMBER</span><strong>{message}</strong></div>
            <div className="card-grid">
              {tracks.map((track) => (
                <button
                  key={track.code}
                  className={`song-card ${track.audio ? "loaded" : ""} ${selected.code === track.code ? "selected" : ""}`}
                  onClick={() => void playTrack(track)}
                  aria-label={`${track.code}, ${track.title} by ${track.artist}${track.audio ? ", playable" : ", display only"}`}
                >
                  <span className="code">{track.code}</span>
                  <span className="copy"><strong>{track.title}</strong><small>{track.artist}</small></span>
                  {track.audio && <span className="dot" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </section>

          <section className="player" aria-label="Music controls">
            <div className="window">
              <div className={`record ${playing ? "spinning" : ""}`} aria-hidden="true">
                <div className="label"><b>DJ CO.</b><span>{selected.code}</span><small>45 RPM</small></div>
              </div>
              <div className={`arm ${playing ? "down" : ""}`} aria-hidden="true" />
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
              <button onClick={() => move(-1)} aria-label="Previous loaded record">◀ PREV</button>
              <button className="play" onClick={() => void toggle()} aria-label={playing ? "Pause" : "Play"}>{playing ? "PAUSE" : "PLAY"}</button>
              <button onClick={() => move(1)} aria-label="Next loaded record">NEXT ▶</button>
            </div>

            <label className="volume">VOLUME <input type="range" min="0" max="1" step="0.05" defaultValue="0.8" onChange={(event) => { if (audioRef.current) audioRef.current.volume = Number(event.target.value); }} /></label>
            <div className="service">SERVICED BY DARLING JUKEBOX CO. · EST. 1985</div>
          </section>
        </div>
      </section>
    </main>
  );
}
