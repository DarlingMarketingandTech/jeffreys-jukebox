"use client";

import { useMemo, useState } from "react";
import type { Track, TrackBucket, TrackArtist } from "@/lib/tracks";

const bucketLabels: Record<TrackBucket, string> = {
  featured: "Featured",
  archive: "Archive",
  raw: "Raw Demos",
};

interface RecordVaultProps {
  tracks: Track[];
  activeTrack: Track;
  playing: boolean;
  onChooseTrack: (track: Track) => void;
  onPlayTrack: (track: Track) => void;
}

export function RecordVault({ tracks, activeTrack, playing, onChooseTrack, onPlayTrack }: RecordVaultProps) {
  const [bucket, setBucket] = useState<TrackBucket | "all">("featured");
  const [artist, setArtist] = useState<TrackArtist | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tracks.filter((track) => {
      if (bucket !== "all" && track.bucket !== bucket) return false;
      if (artist !== "all" && track.artist !== artist) return false;
      if (!needle) return true;
      return `${track.title} ${track.artist} ${track.kind}`.toLowerCase().includes(needle);
    });
  }, [artist, bucket, query, tracks]);

  return (
    <section className="record-vault" aria-label="Jacob and Jeffrey record vault">
      <header className="vault-header">
        <div>
          <span className="vault-kicker">J&J PRIVATE PRESSINGS</span>
          <h2>THE RECORD VAULT</h2>
          <p>Browse the real archive without leaving the jukebox room.</p>
        </div>
        <label className="vault-search">
          <span>SEARCH</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, artist, type…"
            aria-label="Search recordings"
          />
        </label>
      </header>

      <div className="vault-filter-row" role="group" aria-label="Recording filters">
        <div className="vault-switches">
          {(["featured", "archive", "raw", "all"] as const).map((value) => (
            <button
              type="button"
              key={value}
              className={bucket === value ? "active" : ""}
              onClick={() => setBucket(value)}
              aria-pressed={bucket === value}
            >
              {value === "all" ? "All Cuts" : bucketLabels[value]}
            </button>
          ))}
        </div>
        <div className="vault-switches artist-switches">
          {(["all", "Jacob Darling", "Jeffrey Taylor"] as const).map((value) => (
            <button
              type="button"
              key={value}
              className={artist === value ? "active" : ""}
              onClick={() => setArtist(value)}
              aria-pressed={artist === value}
            >
              {value === "all" ? "J + J" : value.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="record-grid">
        {filtered.map((track, index) => {
          const isActive = track.code === activeTrack.code;
          return (
            <article className={`record-card sleeve-${index % 8} ${isActive ? "is-active" : ""}`} key={track.code}>
              <button className="record-sleeve" onClick={() => onChooseTrack(track)} aria-label={`Select ${track.title}`}>
                <span className="sleeve-code">{track.code}</span>
                <span className="sleeve-art-mark">{track.artist === "Jacob Darling" ? "JD" : "JT"}</span>
                <span className="sleeve-title">{track.title}</span>
                <span className="sleeve-meta">{track.kind.toUpperCase()} · {bucketLabels[track.bucket].toUpperCase()}</span>
              </button>
              <div className="record-card-copy">
                <div>
                  <strong>{track.title}</strong>
                  <span>{track.artist}</span>
                </div>
                <button type="button" onClick={() => onPlayTrack(track)}>
                  {isActive && playing ? "PLAYING" : "PLAY"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="vault-empty">No recordings match this shelf.</p>}
    </section>
  );
}
