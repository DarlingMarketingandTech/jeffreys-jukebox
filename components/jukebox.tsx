"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { HazeLighter } from "@/components/HazeLighter";
import { JukeboxCabinet } from "@/components/JukeboxCabinet";
import { MusicDock } from "@/components/MusicDock";
import { useJukeboxAudio } from "@/hooks/useJukeboxAudio";
import { useRemotePlayback } from "@/hooks/useRemotePlayback";
import { useMood } from "@/lib/mood";
import type { Track } from "@/lib/tracks";

const pageLetters = "ABCDEFGHIJKL".split("");

interface JukeboxProps {
  tracks: Track[];
  atmosphereLayer?: ReactNode;
  foregroundLayer?: ReactNode;
}

export function Jukebox({ tracks, atmosphereLayer, foregroundLayer }: JukeboxProps) {
  const movementTimerRef = useRef<number | null>(null);
  const hazeSettledTimerRef = useRef<number | null>(null);
  const { isHazeActive, currentView: look, toggleHaze, setView: setLook } = useMood();
  const mood = isHazeActive ? "hazy" : "clear";

  const [approached, setApproached] = useState(false);
  const [walking, setWalking] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [hazeSettled, setHazeSettled] = useState(false);

  const audio = useJukeboxAudio({ tracks, mood, pageLetters });
  const { remoteSupported, remoteAvailable, remoteState, promptRemotePlayback } = useRemotePlayback(audio.audioRef);

  const sceneImage = look === "left"
    ? "/images/alley-cat-pool-room.webp"
    : look === "right"
      ? "/images/alley-cat-signed-wall.webp"
      : "/images/intro-screen.png";

  useEffect(() => {
    return () => {
      if (movementTimerRef.current) window.clearTimeout(movementTimerRef.current);
      if (hazeSettledTimerRef.current) window.clearTimeout(hazeSettledTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (hazeSettledTimerRef.current) window.clearTimeout(hazeSettledTimerRef.current);
    if (!isHazeActive) {
      setHazeSettled(false);
      return;
    }
    hazeSettledTimerRef.current = window.setTimeout(() => setHazeSettled(true), 5 * 60 * 1000);
    return () => {
      if (hazeSettledTimerRef.current) window.clearTimeout(hazeSettledTimerRef.current);
    };
  }, [isHazeActive]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: audio.activeTrack.title,
      artist: audio.activeTrack.artist,
      album: "Jeffrey's Jukebox · The Alley Cat",
    });
    navigator.mediaSession.playbackState = audio.playing ? "playing" : "paused";

    const handlePlay = () => { void audio.toggleActivePlayback(); };
    const handlePause = () => { void audio.toggleActivePlayback(); };
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
    setLook("center");
    setWalking(true);
    setApproached(nextApproached);
    movementTimerRef.current = window.setTimeout(() => setWalking(false), 1250);
  }

  async function handleHazeToggle() {
    const nextMood = isHazeActive ? "clear" : "hazy";
    toggleHaze();
    await audio.applyMoodSound(nextMood);
  }

  const roomClasses = [
    "bar-room",
    `look-${look}`,
    approached ? "approached" : "standing-back",
    walking ? "camera-moving" : "",
    `mood-${mood}`,
    audio.playing ? "music-playing" : "",
    audio.showMusicDock ? "has-music-dock" : "",
    hazeSettled ? "lazy-drift" : "",
  ].filter(Boolean).join(" ");

  return (
    <main className={roomClasses}>
      <div className="scene-backdrop" data-layer="0-background" aria-hidden="true">
        <Image key={sceneImage} src={sceneImage} alt="" fill priority sizes="100vw" />
      </div>
      <div className="room-shade" aria-hidden="true" />
      <div className="room-haze" aria-hidden="true" />
      <div className="stage-atmosphere" data-layer="1-atmosphere" aria-hidden="true">
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
            <HazeLighter
              isLit={mood === "hazy"}
              label={mood === "hazy" ? "CLEAR THE AIR" : "LIGHT ONE UP"}
              className="arrival-lighter"
              onToggle={handleHazeToggle}
            />
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
        <button onClick={() => setLook("left")} className={look === "left" ? "active" : ""}>← POOL ROOM</button>
        <button onClick={() => setLook("center")} className={look === "center" ? "active" : ""}>JUKEBOX</button>
        <button onClick={() => setLook("right")} className={look === "right" ? "active" : ""}>SIGNED WALL →</button>
      </nav>

      <div className="contents" data-layer="3-foreground">
        {foregroundLayer}
      </div>

      {look !== "center" && (
        <aside className={`bar-story story-${look}`} aria-live="polite">
          <span>{look === "left" ? "THE BACK ROOM" : "SCRATCHED INTO THE WALL"}</span>
          <p>{look === "left"
            ? "The original back bar: pool tables, wood paneling, cheap drinks, and the kind of room that never needed to be reinvented."
            : "Forty years of initials, bad poetry, questionable drawings, and one warning: DON'T PLAY FREE BIRD BEFORE CLOSING."}</p>
          {look === "right" && <div className="story-photo"><Image src="/images/alley-cat-graffiti-alley.webp" alt="The mural-covered alley outside the Alley Cat Lounge" fill sizes="360px" /></div>}
          <button onClick={() => setLook("center")}>TURN BACK TO THE MUSIC</button>
        </aside>
      )}

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
        mood={mood}
        remoteSupported={remoteSupported}
        remoteAvailable={remoteAvailable}
        remoteState={remoteState}
        onChooseTrack={audio.chooseTrack}
        onTurnPage={audio.turnPage}
        onMoveLoaded={(direction) => void audio.moveLoaded(direction)}
        onMainPlay={() => void audio.handleMainPlayButton()}
        onVolumeChange={audio.setVolume}
        onHazeToggle={handleHazeToggle}
        onPromptRemote={() => void promptRemotePlayback(audio.setMessage)}
      />

      {approached && <button className="step-back" onClick={() => moveCamera(false)}>← STEP BACK FROM THE MACHINE</button>}
      <div className="smoke-status" aria-live="polite">{mood === "hazy" ? "ROOM: HAZY" : "ROOM: CLEAR ENOUGH"}</div>

      {audio.showMusicDock && (
        <MusicDock
          activeTrack={audio.activeTrack}
          playing={audio.playing}
          elapsed={audio.elapsed}
          duration={audio.duration}
          remoteState={remoteState}
          remoteSupported={remoteSupported}
          isHazeActive={isHazeActive}
          onTogglePlayback={audio.toggleActivePlayback}
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
