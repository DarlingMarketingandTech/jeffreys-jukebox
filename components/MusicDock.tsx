"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import type { Track } from "@/lib/tracks";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

interface MusicDockProps {
  activeTrack: Track;
  playing: boolean;
  elapsed: number;
  duration: number;
  remoteState: string;
  remoteSupported: boolean;
  onTogglePlayback: () => void;
  onPromptRemote: () => void;
  onSeek: (seconds: number) => void;
}

export function MusicDock({
  activeTrack,
  playing,
  elapsed,
  duration,
  remoteState,
  remoteSupported,
  onTogglePlayback,
  onPromptRemote,
  onSeek,
}: MusicDockProps) {
  const progress = duration ? Math.min(100, (elapsed / duration) * 100) : 0;

  function seekFromPointer(event: MouseEvent<HTMLButtonElement>) {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(duration * ratio);
  }

  function seekFromKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (!duration || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    onSeek(elapsed + (event.key === "ArrowRight" ? 10 : -10));
  }

  return (
    <section className="music-dock bar-tab" aria-label="Persistent music controls">
      <div className={`dock-record ${playing ? "spinning" : ""}`} aria-hidden="true">
        <span>{activeTrack.code}</span>
      </div>
      <div className="dock-copy">
        <span>{remoteState === "connected" ? "PLAYING ON DEVICE" : playing ? "NOW PLAYING" : "PAUSED"}</span>
        <strong>{activeTrack.title}</strong>
        <small>{activeTrack.artist}</small>
      </div>
      <button
        type="button"
        className="dock-progress"
        onClick={seekFromPointer}
        onKeyDown={seekFromKeyboard}
        aria-label={`Seek in ${activeTrack.title}. ${formatTime(elapsed)} of ${formatTime(duration)}.`}
      >
        <i style={{ width: `${progress}%` }} />
        <span>{formatTime(elapsed)} / {formatTime(duration)}</span>
      </button>
      <button
        className="dock-toggle"
        onClick={onTogglePlayback}
        aria-label={playing ? "Pause current song" : "Resume current song"}
      >
        {playing ? "Ⅱ" : "▶"}
      </button>
      {remoteSupported && (
        <button
          className="dock-cast"
          onClick={onPromptRemote}
          aria-label="Play on a compatible TV or speaker"
        >
          ▣
        </button>
      )}
      <footer className="bar-tab-footer">
        <span>{activeTrack.code} · PRIVATE PRESSING</span>
        <span>←/→ SEEK 10 SEC</span>
      </footer>
    </section>
  );
}
