"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AudioReactiveAura } from "@/components/AudioReactiveAura";
import { JukeboxCabinet } from "@/components/JukeboxCabinet";
import { MusicDock } from "@/components/MusicDock";
import { RecordVault } from "@/components/RecordVault";
import { useJukeboxAudio } from "@/hooks/useJukeboxAudio";
import { useRemotePlayback } from "@/hooks/useRemotePlayback";
import { useSceneParallax } from "@/hooks/useSceneParallax";
import type { Track } from "@/lib/tracks";

interface JukeboxProps { tracks: Track[]; }

export function Jukebox({ tracks }: JukeboxProps) {
  const movementTimerRef = useRef<number | null>(null);
  const roomRef = useSceneParallax<HTMLElement>();
  const pageLetters = useMemo(() => Array.from(new Set(tracks.map((track) => track.code[0]))), [tracks]);
  const [approached, setApproached] = useState(false);
  const [walking, setWalking] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const audio = useJukeboxAudio({ tracks, pageLetters });
  const { remoteSupported, remoteAvailable, remoteState, promptRemotePlayback } = useRemotePlayback(audio.audioRef);

  useEffect(() => () => {
    if (movementTimerRef.current) window.clearTimeout(movementTimerRef.current);
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: audio.activeTrack.title,
      artist: audio.activeTrack.artist,
      album: "J&J Jukebox · Private Pressings",
    });
    navigator.mediaSession.playbackState = audio.playing ? "playing" : "paused";
    try {
      navigator.mediaSession.setActionHandler("play", () => void audio.toggleActivePlayback());
      navigator.mediaSession.setActionHandler("pause", () => void audio.toggleActivePlayback());
      navigator.mediaSession.setActionHandler("previoustrack", () => void audio.moveLoaded(-1));
      navigator.mediaSession.setActionHandler("nexttrack", () => void audio.moveLoaded(1));
    } catch {}
    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      } catch {}
    };
  }, [audio.activeTrack, audio.playing, audio.toggleActivePlayback, audio.moveLoaded]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches("input, textarea, select, [contenteditable='true']");
      if (event.key === "Escape") {
        if (vaultOpen) setVaultOpen(false);
        else if (approached) moveCamera(false);
        return;
      }
      if (isTyping || !approached) return;
      if (event.code === "Space") { event.preventDefault(); void audio.toggleActivePlayback(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); void audio.moveLoaded(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); void audio.moveLoaded(1); }
      if (event.key.toLowerCase() === "v") setVaultOpen((current) => !current);
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [approached, vaultOpen, audio.moveLoaded, audio.toggleActivePlayback]);

  function moveCamera(nextApproached: boolean) {
    if (movementTimerRef.current) window.clearTimeout(movementTimerRef.current);
    setWalking(true);
    setApproached(nextApproached);
    if (!nextApproached) setVaultOpen(false);
    movementTimerRef.current = window.setTimeout(() => setWalking(false), 1250);
  }

  const roomClasses = ["bar-room", approached ? "approached" : "standing-back", walking ? "camera-moving" : "", vaultOpen ? "vault-is-open" : "", audio.showMusicDock ? "has-music-dock" : ""].filter(Boolean).join(" ");

  return (
    <main className={roomClasses} ref={roomRef}>
      <div className="scene-frame" data-layer="0-background">
        <Image src="/images/intro-screen.png" alt="A glowing jukebox in a gritty Indianapolis bar room" fill priority sizes="100vw" />
        <div className="scene-shade" aria-hidden="true" />
        {!approached && (
          <button className="jukebox-hotspot" onClick={() => moveCamera(true)} aria-label="Walk up to the jukebox">
            <span className="hotspot-ring" aria-hidden="true" />
            <span className="hotspot-label">WALK UP &amp; PICK A RECORD</span>
          </button>
        )}
      </div>

      <div className="room-shade" aria-hidden="true" />
      <AudioReactiveAura analyser={audio.analyserNode} playing={audio.playing} />
      <div className="room-grain" aria-hidden="true" />
      <div className="door-fade" aria-hidden="true" />

      <div className="bar-location"><b>J&amp;J JUKEBOX</b><span>INDIANAPOLIS · PRIVATE ROOM</span></div>
      <div className="real-library-chip"><b>{tracks.length} CURATED CUTS</b><span>JACOB + JEFFREY</span></div>

      {!approached && (
        <section className="arrival-lockup" aria-label="Jacob and Jeffrey's Jukebox">
          <div className="arrival-logo"><span>PRIVATE PRESSINGS</span><h1>J&amp;J</h1><strong>JUKEBOX</strong><i>45</i></div>
          <p>A private recording archive for Jacob and Jeffrey. Real tracks, one old machine.</p>
          <small>DARLING JUKE JOINT WORKS · INDIANA · MACHINE No. JJ-85</small>
        </section>
      )}

      <JukeboxCabinet
        interactive={approached && !vaultOpen}
        mechanism={audio.mechanism}
        message={audio.message}
        leftLetter={audio.leftLetter}
        rightLetter={audio.rightLetter}
        page={audio.page}
        maxPage={audio.maxPage}
        totalTracks={tracks.length}
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

      {approached && (
        <nav className="jj-mode-switch" aria-label="Jukebox views">
          <button className={!vaultOpen ? "active" : ""} onClick={() => setVaultOpen(false)}>JUKEBOX</button>
          <button className={vaultOpen ? "active" : ""} onClick={() => setVaultOpen(true)}>RECORD VAULT</button>
        </nav>
      )}

      {approached && vaultOpen && (
        <RecordVault
          tracks={tracks}
          activeTrack={audio.activeTrack}
          playing={audio.playing}
          onChooseTrack={audio.chooseTrack}
          onPlayTrack={(track) => void audio.startTrack(track)}
        />
      )}

      {approached && <button className="step-back" onClick={() => moveCamera(false)}>← STEP BACK · ESC</button>}

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
          onSeek={audio.seekTo}
        />
      )}

      <audio ref={audio.audioRef} src={audio.activeTrackAudio} crossOrigin="anonymous" preload="metadata" playsInline {...audio.audioHandlers} />
    </main>
  );
}
