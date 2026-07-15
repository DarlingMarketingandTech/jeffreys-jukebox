"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AudioEmber } from "@/components/AudioEmber";
import { useMood } from "@/lib/mood";
import type { Track } from "@/lib/tracks";

type Mechanism = "idle" | "selecting" | "playing" | "paused" | "rejected";
type Mood = "clear" | "hazy";
type RemoteState = "connecting" | "connected" | "disconnected";
type RemoteEvent = "connecting" | "connect" | "disconnect";

type AudioGraph = {
  context: AudioContext;
  analyser: AnalyserNode;
  dryGain: GainNode;
  wetGain: GainNode;
  lowpass: BiquadFilterNode;
};

type RemotePlaybackHandle = {
  state: RemoteState;
  prompt: () => Promise<void>;
  watchAvailability?: (callback: (available: boolean) => void) => Promise<number>;
  cancelWatchAvailability?: (callbackId: number) => void;
  addEventListener: (name: RemoteEvent, listener: EventListener) => void;
  removeEventListener: (name: RemoteEvent, listener: EventListener) => void;
};

type CastableAudio = HTMLAudioElement & { remote?: RemotePlaybackHandle };

const pageLetters = "ABCDEFGHIJKL".split("");

interface JukeboxProps {
  tracks: Track[];
  atmosphereLayer?: ReactNode;
  foregroundLayer?: ReactNode;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

function buildImpulseResponse(context: AudioContext) {
  const length = Math.floor(context.sampleRate * 1.15);
  const impulse = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 3.5);
    }
  }

  return impulse;
}

export function Jukebox({ tracks, atmosphereLayer, foregroundLayer }: JukeboxProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioGraphRef = useRef<AudioGraph | null>(null);
  const movementTimerRef = useRef<number | null>(null);
  const loaded = useMemo(() => tracks.filter((track) => track.audio), [tracks]);
  const firstTrack = loaded[0] ?? tracks[0];
  const { isHazeActive, currentView: look, toggleHaze, setView: setLook } = useMood();
  const mood = isHazeActive ? "hazy" : "clear";

  const [approached, setApproached] = useState(false);
  const [walking, setWalking] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Track>(firstTrack);
  const [activeTrack, setActiveTrack] = useState<Track>(firstTrack);
  const [playing, setPlaying] = useState(false);
  const [mechanism, setMechanism] = useState<Mechanism>("idle");
  const [message, setMessage] = useState("PICK A TITLE · THEN PRESS PLAY");
  const [volume, setVolume] = useState(0.82);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [remoteSupported, setRemoteSupported] = useState(false);
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const [remoteState, setRemoteState] = useState<RemoteState>("disconnected");

  const leftLetter = pageLetters[page];
  const rightLetter = pageLetters[page + 1];
  const visibleTracks = tracks.filter((track) =>
    track.code.startsWith(leftLetter) || (rightLetter ? track.code.startsWith(rightLetter) : false),
  );
  const mechanismTrack = playing ? activeTrack : selected.audio ? selected : activeTrack;
  const selectedIsActive = selected.code === activeTrack.code;
  const showMusicDock = playing || elapsed > 0;
  const sceneImage = look === "left"
    ? "/images/alley-cat-pool-room.webp"
    : look === "right"
      ? "/images/alley-cat-signed-wall.webp"
      : "/images/intro-screen.png";

  useEffect(() => {
    return () => {
      if (movementTimerRef.current) window.clearTimeout(movementTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeTrack.title,
      artist: activeTrack.artist,
      album: "Jeffrey's Jukebox · The Alley Cat",
    });
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [activeTrack, playing]);

  useEffect(() => {
    const audio = audioRef.current as CastableAudio | null;
    const remote = audio?.remote;
    if (!remote) return;

    setRemoteSupported(true);
    setRemoteState(remote.state);
    const syncState = () => setRemoteState(remote.state);
    remote.addEventListener("connecting", syncState);
    remote.addEventListener("connect", syncState);
    remote.addEventListener("disconnect", syncState);

    let watchId: number | undefined;
    void remote.watchAvailability?.((available) => setRemoteAvailable(available))
      .then((id) => { watchId = id; })
      .catch(() => setRemoteAvailable(false));

    return () => {
      remote.removeEventListener("connecting", syncState);
      remote.removeEventListener("connect", syncState);
      remote.removeEventListener("disconnect", syncState);
      if (watchId !== undefined) remote.cancelWatchAvailability?.(watchId);
    };
  }, []);

  function moveCamera(nextApproached: boolean) {
    if (movementTimerRef.current) window.clearTimeout(movementTimerRef.current);
    setLook("center");
    setWalking(true);
    setApproached(nextApproached);
    movementTimerRef.current = window.setTimeout(() => setWalking(false), 1250);
  }

  function ensureAudioGraph() {
    if (audioGraphRef.current) return audioGraphRef.current;
    const audio = audioRef.current;
    if (!audio) return null;

    try {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      const dryGain = context.createGain();
      const wetGain = context.createGain();
      const lowpass = context.createBiquadFilter();
      const convolver = context.createConvolver();

      lowpass.type = "lowpass";
      analyser.fftSize = 64;
      convolver.buffer = buildImpulseResponse(context);
      source.connect(analyser);
      analyser.connect(dryGain).connect(context.destination);
      analyser.connect(lowpass).connect(convolver).connect(wetGain).connect(context.destination);

      audioGraphRef.current = { context, analyser, dryGain, wetGain, lowpass };
      return audioGraphRef.current;
    } catch {
      return null;
    }
  }

  async function applyMoodSound(nextMood: Mood) {
    const graph = ensureAudioGraph();
    if (!graph) return;
    if (graph.context.state === "suspended") await graph.context.resume();

    graph.dryGain.gain.setTargetAtTime(nextMood === "hazy" ? 0.82 : 1, graph.context.currentTime, 0.08);
    graph.wetGain.gain.setTargetAtTime(nextMood === "hazy" ? 0.2 : 0, graph.context.currentTime, 0.08);
    graph.lowpass.frequency.setTargetAtTime(nextMood === "hazy" ? 2750 : 5600, graph.context.currentTime, 0.08);
  }

  async function handleHazeToggle() {
    const nextMood = isHazeActive ? "clear" : "hazy";
    toggleHaze();
    await applyMoodSound(nextMood);
  }

  function chooseTrack(track: Track) {
    setSelected(track);
    setMessage(track.audio
      ? `${track.code} SELECTED · ${playing ? "CURRENT SONG KEEPS PLAYING" : "PRESS PLAY"}`
      : `${track.code} · TITLE CARD ONLY`);
    if (!playing) setMechanism("idle");
  }

  async function startTrack(track: Track) {
    const audio = audioRef.current;
    if (!audio || !track.audio) return;

    if (audio.currentSrc !== track.audio && audio.src !== track.audio) {
      audio.pause();
      audio.src = track.audio;
      audio.load();
    }

    setActiveTrack(track);
    setSelected(track);
    setMechanism("selecting");
    setMessage(`PULLING ${track.code} FROM THE RACK…`);

    try {
      await applyMoodSound(mood);
      await audio.play();
      setPlaying(true);
      await wait(720);
      setMechanism("playing");
      setMessage(`NOW PLAYING · ${track.code}`);
    } catch {
      setPlaying(false);
      setMechanism("idle");
      setMessage("TAP PLAY AGAIN TO START");
    }
  }

  async function startSelected() {
    if (!selected.audio) {
      setMechanism("rejected");
      setMessage("SORRY PAL · THAT RECORD ISN'T LOADED");
      await wait(850);
      setMechanism(playing ? "playing" : "idle");
      return;
    }
    await startTrack(selected);
  }

  async function toggleActivePlayback() {
    const audio = audioRef.current;
    if (!audio || !activeTrack.audio) return;

    if (audio.paused) {
      try {
        await applyMoodSound(mood);
        await audio.play();
        setPlaying(true);
        setMechanism("playing");
        setMessage(`NOW PLAYING · ${activeTrack.code}`);
      } catch {
        setMessage("TAP PLAY AGAIN TO START");
      }
    } else {
      audio.pause();
      setPlaying(false);
      setMechanism("paused");
      setMessage(`PAUSED · ${activeTrack.code}`);
    }
  }

  async function handleMainPlayButton() {
    if (!selected.audio || !selectedIsActive) {
      await startSelected();
      return;
    }
    await toggleActivePlayback();
  }

  async function moveLoaded(direction: number) {
    const index = loaded.findIndex((track) => track.code === activeTrack.code);
    const next = loaded[(Math.max(index, 0) + direction + loaded.length) % loaded.length];
    setPage(Math.floor(pageLetters.indexOf(next.code[0]) / 2) * 2);
    await startTrack(next);
  }

  function turnPage(direction: number) {
    setPage((current) => Math.min(10, Math.max(0, current + direction * 2)));
    setMessage(playing ? `${activeTrack.code} KEEPS SPINNING · BROWSE AWAY` : "TITLE PAGES TURNED");
  }

  async function promptRemotePlayback() {
    const audio = audioRef.current as CastableAudio | null;
    if (!audio?.remote) return;

    try {
      setMessage("LOOKING FOR A TV OR SPEAKER…");
      await audio.remote.prompt();
      setRemoteState(audio.remote.state);
      setMessage(audio.remote.state === "connected" ? "PLAYING ON YOUR OTHER DEVICE" : "DEVICE PICKER CLOSED");
    } catch {
      setMessage("NO COMPATIBLE PLAYBACK DEVICE FOUND");
    }
  }

  return (
    <main className={`bar-room look-${look} ${approached ? "approached" : "standing-back"} ${walking ? "camera-moving" : ""} mood-${mood} ${playing ? "music-playing" : ""}`}>
      <div className="scene-backdrop" data-layer="0-background" aria-hidden="true">
        <Image key={sceneImage} src={sceneImage} alt="" fill priority sizes="100vw" />
      </div>
      <div className="room-shade" aria-hidden="true" />
      <div className="stage-atmosphere absolute inset-0 z-[5] h-full w-full pointer-events-none" data-layer="1-atmosphere" aria-hidden="true">
        {atmosphereLayer}
      </div>
      <div className="room-grain" aria-hidden="true" />
      <div className="door-fade" aria-hidden="true" />

      <div className="bar-location" data-layer="3-controls"><b>THE ALLEY CAT</b><span>INDIANAPOLIS · BACK ROOM</span></div>

      {!approached && look === "center" && (
        <section className="arrival-lockup" data-layer="3-controls" aria-label="Enter Jeffrey's listening room">
          <div className="arrival-logo">
            <span>PRIVATE PRESSINGS</span>
            <h1>JEFFREY&apos;S</h1>
            <strong>JUKEBOX</strong>
            <i>JT</i>
          </div>
          <p>Five Jeffrey Taylor originals. One old machine. Your stool is still open.</p>
          <div className="arrival-actions">
            <button className="step-up" onClick={() => moveCamera(true)}>WALK UP &amp; PICK A SONG <b>→</b></button>
            <button className="arrival-smoke" onClick={() => void handleHazeToggle()}>{mood === "hazy" ? "CLEAR THE AIR" : "LIGHT ONE UP"}</button>
          </div>
          <button className="about-trigger" onClick={() => setAboutOpen(true)}>ABOUT THE CAT · 6267 CARROLLTON AVE</button>
          <small>DARLING JUKE JOINT WORKS · INDIANA · MACHINE No. JT-85</small>
        </section>
      )}

      {aboutOpen && (
        <aside className="about-panel" aria-label="About the Alley Cat Lounge">
          <div className="about-photo"><Image src="/images/alley-cat-exterior.webp" alt="The alley entrance and illuminated Alley Cat Lounge sign" fill sizes="420px" /></div>
          <span>ABOUT THE ALLEY CAT</span>
          <h2>Broad Ripple&apos;s hole-in-the-wall since way back.</h2>
          <p>Tucked away at 6267 Carrollton Ave, the Alley Cat Lounge is an Indianapolis dive-bar institution: strong affordable drinks, pool, arcade games, a jukebox, and absolutely no attitude.</p>
          <p>No reservations. Walk in, grab a drink, find a booth, and see where the night takes you.</p>
          <div><b>THE ORIGINAL BACK BAR</b><small>POOL · ARCADE · JUKEBOX · 7AM–3AM DAILY</small></div>
          <button onClick={() => setAboutOpen(false)}>CLOSE &amp; GET BACK TO THE MUSIC</button>
        </aside>
      )}

      <nav className="look-controls" data-layer="3-controls" aria-label="Look around the bar">
        <button onClick={() => setLook("left")} className={look === "left" ? "active" : ""}>← BAR</button>
        <button onClick={() => setLook("center")} className={look === "center" ? "active" : ""}>JUKEBOX</button>
        <button onClick={() => setLook("right")} className={look === "right" ? "active" : ""}>WALL →</button>
      </nav>

      <div className="contents" data-layer="3-foreground">
        {foregroundLayer}
      </div>

      {look !== "center" && (
        <aside className={`bar-story story-${look}`} aria-live="polite">
          <span>{look === "left" ? "AT THE BAR" : "SCRATCHED INTO THE WALL"}</span>
          <p>{look === "left" ? "The original back bar: pool tables, wood paneling, cheap drinks, and the kind of room that never needed to be reinvented." : "Forty years of initials, bad poetry, questionable drawings, and one warning: DON’T PLAY FREE BIRD BEFORE CLOSING."}</p>
          {look === "right" && <div className="story-photo"><Image src="/images/alley-cat-graffiti-alley.webp" alt="The mural-covered alley outside the Alley Cat Lounge" fill sizes="360px" /></div>}
          <button onClick={() => setLook("center")}>TURN BACK TO THE MUSIC</button>
        </aside>
      )}

      <section className="jukebox-zone" data-layer="2-jukebox" aria-label="Darling Juke Joint Works jukebox">
        <div className={`cabinet mechanism-${mechanism}`}>
          <div className="cabinet-glow" aria-hidden="true" />
          <div className="cabinet-scratches" aria-hidden="true" />
          <span className="cabinet-sticker sticker-one" aria-hidden="true">ALLEY<br />CAT</span>
          <span className="cabinet-sticker sticker-two" aria-hidden="true">NO<br />REQUESTS</span>
          <header className="machine-marquee">
            <span className="marquee-note">♪</span>
            <div><small>DARLING JUKE JOINT WORKS · No. 85</small><h2>JEFFREY&apos;S</h2><b>PRIVATE PRESSINGS</b></div>
            <span className="coin-badge">10¢</span>
          </header>

          <div className="machine-body">
            <section className="catalog" aria-label="Song title catalog">
              <div className="catalog-topline"><span>SELECT A RECORD</span><strong>{message}</strong><span>{leftLetter}/{rightLetter}</span></div>
              <div className="title-book" key={page}>
                {[leftLetter, rightLetter].filter(Boolean).map((letter) => (
                  <div className="title-page" key={letter}>
                    <div className="page-tab">{letter}1–{letter}10</div>
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
                <button onClick={() => turnPage(-1)} disabled={page === 0}>◀ BACK</button>
                <span>120 TITLES · 5 JEFFREY CUTS</span>
                <button onClick={() => turnPage(1)} disabled={page >= 10}>NEXT ▶</button>
              </div>
            </section>

            <section className="mechanism-window" aria-label="Visible record mechanism">
              <div className="record-stack" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <div className={`vinyl ${playing ? "spinning" : ""}`} aria-hidden="true"><div><small>JT</small><strong>{mechanismTrack.code}</strong><span>45 RPM</span></div></div>
              <div className="selector-arm" aria-hidden="true"><span /></div>
              <div className="needle-arm" aria-hidden="true" />
              <div className="mechanism-caption">AUTOMATIC CHANGER · SERVICED WHENEVER JACOB REMEMBERS</div>
            </section>

            <section className="control-deck" aria-label="Playback controls">
              <div className="now-playing" aria-live="polite">
                <span>{playing ? "NOW SPINNING" : "ON THE TURNTABLE"}</span>
                <strong>{activeTrack.code} · {activeTrack.title}</strong>
                <small>{activeTrack.artist}</small>
                {!selectedIsActive && <em>NEXT PICK: {selected.code} · {selected.title}</em>}
              </div>
              <div className="transport">
                <button onClick={() => void moveLoaded(-1)} aria-label="Previous Jeffrey recording">◀</button>
                <button className="play-button" onClick={() => void handleMainPlayButton()}>{playing && selectedIsActive ? "PAUSE" : `PLAY ${selected.code}`}</button>
                <button onClick={() => void moveLoaded(1)} aria-label="Next Jeffrey recording">▶</button>
              </div>
              <label className="volume-control"><span>VOLUME</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
              <div className="machine-actions">
                <button className={`smoke-switch ${mood === "hazy" ? "lit" : ""}`} onClick={() => void handleHazeToggle()}>{mood === "hazy" ? "CLEAR AIR" : "HAZE"}</button>
                {remoteSupported && <button className={`cast-button state-${remoteState}`} onClick={() => void promptRemotePlayback()} disabled={!remoteAvailable && remoteState === "disconnected"}>{remoteState === "connected" ? "ON DEVICE" : "PLAY ON TV"}</button>}
              </div>
            </section>
          </div>

          <footer className="maker-plate"><b>DARLING JUKE JOINT WORKS</b><span>INDIANA · EST. 1985</span><small>S/N JEFF-TAYLOR-001</small></footer>
        </div>
      </section>

      {approached && <button className="step-back" onClick={() => moveCamera(false)}>← STEP BACK FROM THE MACHINE</button>}
      <div className="smoke-status" aria-live="polite">{mood === "hazy" ? "ROOM: HAZY" : "ROOM: CLEAR ENOUGH"}</div>
      <AudioEmber analyserNode={audioGraphRef.current?.analyser ?? null} isPlaying={playing} />

      {showMusicDock && (
        <section className="music-dock" aria-label="Persistent music controls">
          <div className={`dock-record ${playing ? "spinning" : ""}`} aria-hidden="true"><span>{activeTrack.code}</span></div>
          <div className="dock-copy"><span>{remoteState === "connected" ? "PLAYING ON DEVICE" : playing ? "NOW PLAYING" : "PAUSED"}</span><strong>{activeTrack.title}</strong><small>{activeTrack.artist}</small></div>
          <div className="dock-progress"><i style={{ width: `${duration ? Math.min(100, (elapsed / duration) * 100) : 0}%` }} /><span>{formatTime(elapsed)} / {formatTime(duration)}</span></div>
          <button className="dock-toggle" onClick={() => void toggleActivePlayback()} aria-label={playing ? "Pause current song" : "Resume current song"}>{playing ? "Ⅱ" : "▶"}</button>
          {remoteSupported && <button className="dock-cast" onClick={() => void promptRemotePlayback()} aria-label="Play on a compatible TV or speaker">▣</button>}
        </section>
      )}

      <audio
        ref={audioRef}
        src={activeTrack.audio}
        crossOrigin="anonymous"
        preload="metadata"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => void moveLoaded(1)}
        onError={() => { setPlaying(false); setMechanism("idle"); setMessage("THE RECORD SKIPPED · TRY AGAIN"); }}
      />
    </main>
  );
}
