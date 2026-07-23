"use client";

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
}: MusicDockProps) {
  const tabPrice = activeTrack.audio ? "FREE (VIP)" : "10¢";
  const tabMood = "1 Cold Beer";

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
      <div className="dock-progress">
        <i style={{ width: `${duration ? Math.min(100, (elapsed / duration) * 100) : 0}%` }} />
        <span>{formatTime(elapsed)} / {formatTime(duration)}</span>
      </div>
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
        <span>{activeTrack.code} · {tabPrice}</span>
        <span>Current Tab: {tabMood}</span>
      </footer>
    </section>
  );
}
