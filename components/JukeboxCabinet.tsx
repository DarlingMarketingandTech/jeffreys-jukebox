"use client";

import type { Mechanism } from "@/hooks/useJukeboxAudio";
import type { Track } from "@/lib/tracks";
import { VuMeter } from "@/components/VuMeter";
import { useCabinetTilt } from "@/hooks/useCabinetTilt";

interface JukeboxCabinetProps {
  interactive: boolean;
  mechanism: Mechanism;
  message: string;
  leftLetter: string;
  rightLetter: string;
  page: number;
  maxPage: number;
  totalTracks: number;
  visibleTracks: Track[];
  selected: Track;
  mechanismTrack: Track;
  activeTrack: Track;
  playing: boolean;
  selectedIsActive: boolean;
  volume: number;
  analyserNode: AnalyserNode | null;
  remoteSupported: boolean;
  remoteAvailable: boolean;
  remoteState: string;
  onChooseTrack: (track: Track) => void;
  onTurnPage: (direction: number) => void;
  onMoveLoaded: (direction: number) => void;
  onMainPlay: () => void;
  onVolumeChange: (volume: number) => void;
  onPromptRemote: () => void;
}

export function JukeboxCabinet({
  interactive,
  mechanism,
  message,
  leftLetter,
  rightLetter,
  page,
  maxPage,
  totalTracks,
  visibleTracks,
  selected,
  mechanismTrack,
  activeTrack,
  playing,
  selectedIsActive,
  volume,
  analyserNode,
  remoteSupported,
  remoteAvailable,
  remoteState,
  onChooseTrack,
  onTurnPage,
  onMoveLoaded,
  onMainPlay,
  onVolumeChange,
  onPromptRemote,
}: JukeboxCabinetProps) {
  const stageRef = useCabinetTilt<HTMLDivElement>();

  return (
    <section
      className="jukebox-zone"
      data-layer="2-jukebox"
      aria-label="Darling Juke Joint Works jukebox"
      inert={!interactive}
    >
      <div className="cabinet-stage" ref={stageRef}>
        <div className={`cabinet mechanism-${mechanism}`}>
          <div className="cabinet-depth cabinet-depth-left" aria-hidden="true" />
          <div className="cabinet-depth cabinet-depth-right" aria-hidden="true" />
          <div className="cabinet-underglow" aria-hidden="true" />
          <div className="cabinet-glow" aria-hidden="true" />
          <div className="cabinet-scratches" aria-hidden="true" />
          <span className="cabinet-sticker sticker-one" aria-hidden="true">ALLEY<br />CAT</span>
          <span className="cabinet-sticker sticker-two" aria-hidden="true">REAL<br />CUTS</span>
          <span className="cabinet-sticker sticker-serviced" aria-hidden="true">SERVICED<br />BY JACOB</span>

          <header className="machine-marquee">
            <span className="speaker-grille grille-left" aria-hidden="true"><i /><i /></span>
            <div>
              <small>DARLING JUKE JOINT WORKS · No. 85</small>
              <h2>J<span className="marquee-flicker">E</span>FFREY&apos;S</h2>
              <b>PRIVATE PRESSINGS · REAL ARCHIVE</b>
            </div>
            <span className="speaker-grille grille-right" aria-hidden="true"><i /><i /></span>
          </header>

          <div className="machine-body">
            <section className="catalog" aria-label="Real recording catalog">
              <div className="canopy-lamps" aria-hidden="true"><i /><i /></div>
              <div className="catalog-topline">
                <span>SELECT A RECORD</span>
                <strong>{message}</strong>
                <span>{leftLetter}{rightLetter ? `/${rightLetter}` : ""}</span>
              </div>

              <div className="title-book" key={page}>
                {[leftLetter, rightLetter].filter(Boolean).map((letter) => (
                  <div className="title-page" key={letter}>
                    <div className="page-tab">{letter} · PRIVATE PRESSINGS</div>
                    {visibleTracks.filter((track) => track.code.startsWith(letter)).map((track) => (
                      <button
                        key={track.code}
                        className={`title-strip jeffrey-cut ${selected.code === track.code ? "selected" : ""}`}
                        onClick={() => onChooseTrack(track)}
                        aria-pressed={selected.code === track.code}
                      >
                        <span className="selection-code">{track.code}</span>
                        <span className="title-copy">
                          <strong>{track.title}</strong>
                          <small>{track.artist}</small>
                        </span>
                        <span className="loaded-mark" title="Playable private recording">45</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              <div className="page-controls">
                <button onClick={() => onTurnPage(-1)} disabled={page === 0}>◀ BACK</button>
                <span>{totalTracks} REAL CUTS · NO FILLER</span>
                <button onClick={() => onTurnPage(1)} disabled={page >= maxPage}>NEXT ▶</button>
              </div>
              <div className="catalog-glass" aria-hidden="true" />
            </section>

            <section className="mechanism-window" aria-label="Visible record mechanism">
              <div className="record-stack" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <div className={`vinyl ${playing ? "spinning" : ""}`} aria-hidden="true">
                <div>
                  <small>45</small>
                  <strong>{mechanismTrack.code}</strong>
                  <span>RPM</span>
                </div>
              </div>
              <div className="selector-arm" aria-hidden="true"><span /></div>
              <div className="needle-arm" aria-hidden="true" />
              <div className="mechanism-caption">REAL ARCHIVE · AUTOMATIC CHANGER · WEB AUDIO REACTIVE</div>
            </section>

            <section className="control-deck" aria-label="Playback controls">
              <div className="now-playing" aria-live="polite">
                <span>{playing ? "NOW SPINNING" : "ON THE TURNTABLE"}</span>
                <strong>{activeTrack.code} · {activeTrack.title}</strong>
                <small>{activeTrack.artist}</small>
                {!selectedIsActive && <em>NEXT PICK: {selected.code} · {selected.title}</em>}
              </div>
              <div className="transport">
                <button onClick={() => void onMoveLoaded(-1)} aria-label="Previous recording">◀</button>
                <button className="play-button" onClick={() => void onMainPlay()}>
                  {playing && selectedIsActive ? "PAUSE" : `PLAY ${selected.code}`}
                </button>
                <button onClick={() => void onMoveLoaded(1)} aria-label="Next recording">▶</button>
              </div>
              <VuMeter analyser={analyserNode} playing={playing} />
              <label className="volume-control">
                <span>VOLUME</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(event) => onVolumeChange(Number(event.target.value))}
                />
              </label>
              {remoteSupported && (
                <div className="machine-actions">
                  <button
                    className={`cast-button state-${remoteState}`}
                    onClick={() => void onPromptRemote()}
                    disabled={!remoteAvailable && remoteState === "disconnected"}
                  >
                    {remoteState === "connected" ? "ON DEVICE" : "PLAY ON TV"}
                  </button>
                </div>
              )}
            </section>
          </div>

          <footer className="maker-plate">
            <b>DARLING JUKE JOINT WORKS</b>
            <span>INDIANA · PRIVATE ARCHIVE</span>
            <small>S/N JD-JT-001</small>
          </footer>
        </div>
      </div>
    </section>
  );
}
