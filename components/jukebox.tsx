"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BarPhilosophy } from "@/components/BarPhilosophy";
import { JukeboxCabinet } from "@/components/JukeboxCabinet";
import { MusicDock } from "@/components/MusicDock";
import { useJukeboxAudio } from "@/hooks/useJukeboxAudio";
import { useRemotePlayback } from "@/hooks/useRemotePlayback";
import { useMood } from "@/lib/mood";
import type { Track } from "@/lib/tracks";

const pageLetters = "ABCDEFGHIJKL".split("");

interface JukeboxProps {
  tracks: Track[];
}

export function Jukebox({ tracks }: JukeboxProps) {
  const movementTimerRef = useRef<number | null>(null);
  const { currentView, setView } = useMood();
  const mood = currentView;

  const [approached, setApproached] = useState(false);
  const [walking, setWalking] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const audio = useJukeboxAudio({ tracks, mood, pageLetters });
  const { remoteSupported, remoteAvailable, remoteState, promptRemotePlayback } = useRemotePlayback(audio.audioRef);
  const sceneImage = "/images/intro-screen.png";

  useEffect(() => {
    if (!aboutOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAboutOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [aboutOpen]);

  useEffect(() => {
    return () => {
      if (movementTimerRef.current) window.clearTimeout(movementTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: audio.activeTrack.title,
      artist: audio.activeTrack.artist,
      album: "Jeffrey's Jukebox · The Alley Cat",
    });
    navigator.mediaSession.playbackState = audio.playing ? "playing" : "paused";

    const handlePlay = () => {
      if (audio.audioRef.current?.paused) void audio.toggleActivePlayback();
    };
    const handlePause = () => {
      if (audio.audioRef.current && !audio.audioRef.current.paused) void audio.toggleActivePlayback();
    };
    const handlePrevious = () => { void audio.moveLoaded(-1); };
    const handleNext = () => { void audio.moveLoaded(1); };

    try {
      navigator.mediaSession.setActionHandler("play", handlePlay);
      navigator.mediaSession.setActionHandler("pause", handlePause);
      navigator.mediaSession.setActionHandler("previoustrack", handlePrevious);
      navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    } catch {
      // Some browsers reject action handlers
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [audio.activeTrack, audio.playing, audio.toggleActivePlayback, audio.moveLoaded]);

  function moveCamera(nextApproached: boolean) {
    if (movementTimerRef.current) window.clearTimeout(movementTimerRef.current);
    setWalking(true);
    setApproached(nextApproached);
    movementTimerRef.current = window.setTimeout(() => setWalking(false), 1250);
  }

  const roomClasses = [
    "bar-room",
    approached ? "approached" : "standing-back",
    walking ? "camera-moving" : "",
    `mood-${mood}`,
    audio.showMusicDock ? "has-music-dock" : "",
  ].filter(Boolean).join(" ");

  return (
    <main className={roomClasses}>
      <div className="scene-backdrop" data-layer="0-background" aria-hidden="true">
        <Image key={sceneImage} src={sceneImage} alt="" fill priority sizes="100vw" />
      </div>
      <div className="room-shade" aria-hidden="true" />
      <div className="night-air" aria-hidden="true" />
      <div className="room-grain" aria-hidden="true" />
      <div className="door-fade" aria-hidden="true" />

      <div className="room-shade" aria-hidden="true" />
      <div className="night-air" aria-hidden="true" />
      <div className="room-grain" aria-hidden="true" />
      <div className="door-fade" aria-hidden="true" />

      {!approached && (
        <section className="arrival-lockup" data-layer="3-controls" aria-label="Welcome to Jeffrey's listening room">
          <div className="arrival-logo">
            <span>PRIVATE PRESSINGS</span>
            <h1>JEFFREY&apos;S</h1>
            <strong>JUKEBOX</strong>
            <i>JT</i>
          </div>
          <p>Five Jeffrey Taylor originals. One old machine. Your stool is still open.</p>
          <div className="arrival-actions">
            <button className="step-up" onClick={() => moveCamera(true)}>WALK UP &amp; PICK A SONG <b>→</b></button>
          </div>
          <button className="about-trigger" onClick={() => setAboutOpen(true)}>ABOUT THE CAT · 6267 CARROLLTON AVE</button>
          <small>DARLING JUKE JOINT WORKS · INDIANA · MACHINE No. JT-85</small>
        </section>
      )}

      {aboutOpen && (
        <aside className="about-panel" role="dialog" aria-modal="true" aria-label="About the Alley Cat Lounge">
          <button
            type="button"
            className="about-panel-close"
            onClick={() => setAboutOpen(false)}
            aria-label="Close the About panel"
          >
            ×
          </button>
          <div className="about-photo"><Image src="/images/alley-cat-exterior.webp" alt="The alley entrance and illuminated Alley Cat Lounge sign" fill sizes="420px" /></div>
          <span>ABOUT THE ALLEY CAT</span>
          <h2>Broad Ripple&apos;s hole-in-the-wall since way back.</h2>
          <p>Tucked away at 6267 Carrollton Ave, the Alley Cat Lounge is an Indianapolis dive-bar institution: strong affordable drinks, pool, arcade games, a jukebox, and absolutely no attitude.</p>
          <p>No reservations. Walk in, grab a drink, find a booth, and see where the night takes you.</p>
          <div><b>THE ORIGINAL BACK BAR</b><small>POOL · ARCADE · JUKEBOX · 7AM–3AM DAILY</small></div>
          <button onClick={() => setAboutOpen(false)}>CLOSE &amp; GET BACK TO THE MUSIC</button>
        </aside>
      )}

      <BarPhilosophy />

      <JukeboxCabinet
        mechanism={audio.mechanism}
        message={audio.message}
        leftLetter={audio.leftLetter}
        rightLetter={audio.rightLetter}
        page={audio.page}
        visibleTracks={audio.visibleTracks}
        selected={audio.selected}
        mechanismTrack={audio.mechanismTrack}
        activeTrack={audio.activeTrack}
        playing={audio.playing}
        selectedIsActive={audio.selectedIsActive}
        volume={audio.volume}
        analyserNode={audio.analyserNode}
        remoteSupported={remoteSupported}
        remoteAvailable={remoteAvailable}
        remoteState={remoteState}
        onChooseTrack={audio.chooseTrack}
        onTurnPage={audio.turnPage}
        onMoveLoaded={(direction) => void audio.moveLoaded(direction)}
        onMainPlay={() => void audio.handleMainPlayButton()}
        onVolumeChange={audio.setVolume}
        onPromptRemote={() => void promptRemotePlayback(audio.setMessage)}
      />

      {approached && <button className="step-back" onClick={() => moveCamera(false)}>← STEP BACK FROM THE MACHINE</button>}
      <div className="room-status" aria-live="polite">INSIDE · BACK ROOM</div>

      {audio.showMusicDock && (
        <MusicDock
          activeTrack={audio.activeTrack}
          playing={audio.playing}
          elapsed={audio.elapsed}
          duration={audio.duration}
          remoteState={remoteState}
          remoteSupported={remoteSupported}
          onTogglePlayback={() => void audio.toggleActivePlayback()}
          onPromptRemote={() => void promptRemotePlayback(audio.setMessage)}
        />
      )}

      <audio
        ref={audio.audioRef}
        src={audio.activeTrackAudio}
        crossOrigin="anonymous"
        preload="metadata"
        playsInline
        {...audio.audioHandlers}
      />
    </main>
  );
}
