"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { JukeboxCabinet } from "@/components/JukeboxCabinet";
import { MusicDock } from "@/components/MusicDock";
import { useJukeboxAudio } from "@/hooks/useJukeboxAudio";
import { useRemotePlayback } from "@/hooks/useRemotePlayback";
import { useSceneParallax } from "@/hooks/useSceneParallax";
import type { Track } from "@/lib/tracks";

const pageLetters = "ABCDEFGHIJKL".split("");

interface JukeboxProps {
  tracks: Track[];
}

export function Jukebox({ tracks }: JukeboxProps) {
  const movementTimerRef = useRef<number | null>(null);
  const roomRef = useSceneParallax<HTMLElement>();

  const [approached, setApproached] = useState(false);
  const [walking, setWalking] = useState(false);

  const audio = useJukeboxAudio({ tracks, pageLetters });
  const { remoteSupported, remoteAvailable, remoteState, promptRemotePlayback } = useRemotePlayback(audio.audioRef);

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
    audio.showMusicDock ? "has-music-dock" : "",
  ].filter(Boolean).join(" ");

  return (
    <main className={roomClasses} ref={roomRef}>
      <div className="scene-frame" data-layer="0-background">
        <Image
          src="/images/intro-screen.png"
          alt="The back room of the Alley Cat Lounge: an old jukebox glowing teal against a wall of framed photos, a stool waiting in front of it"
          fill
          priority
          sizes="100vw"
        />
        <div className="scene-shade" aria-hidden="true" />
        {!approached && (
          <button
            className="jukebox-hotspot"
            onClick={() => moveCamera(true)}
            aria-label="Walk up to the jukebox and pick a song"
          >
            <span className="hotspot-ring" aria-hidden="true" />
            <span className="hotspot-label">WALK UP &amp; PICK A SONG</span>
          </button>
        )}
      </div>
      <div className="room-shade" aria-hidden="true" />
      <div className="room-grain" aria-hidden="true" />
      <div className="door-fade" aria-hidden="true" />

      <div className="bar-location" data-layer="3-controls"><b>THE ALLEY CAT</b><span>INDIANAPOLIS · BACK ROOM</span></div>

      {!approached && (
        <section className="arrival-lockup" data-layer="3-controls" aria-label="Jeffrey's Jukebox at the Alley Cat">
          <div className="arrival-logo">
            <span>PRIVATE PRESSINGS</span>
            <h1>JEFFREY&apos;S</h1>
            <strong>JUKEBOX</strong>
            <i>JT</i>
          </div>
          <p>Five Jeffrey Taylor originals. One old machine. Your stool is still open.</p>
          <small>DARLING JUKE JOINT WORKS · INDIANA · MACHINE No. JT-85</small>
        </section>
      )}

      <JukeboxCabinet
        interactive={approached}
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
