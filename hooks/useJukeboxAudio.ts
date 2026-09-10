"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import type { Track } from "@/lib/tracks";

export type Mechanism = "idle" | "selecting" | "playing" | "paused" | "rejected";

export type AudioGraph = {
  context: AudioContext;
  analyser: AnalyserNode;
};

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

interface UseJukeboxAudioOptions {
  tracks: Track[];
  pageLetters: string[];
}

export function useJukeboxAudio({ tracks, pageLetters }: UseJukeboxAudioOptions) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioGraphRef = useRef<AudioGraph | null>(null);

  const loaded = useMemo(() => tracks.filter((track) => Boolean(track.audio)), [tracks]);
  const firstTrack = loaded[0] ?? tracks[0];
  const maxPage = Math.max(0, Math.floor((Math.max(pageLetters.length, 1) - 1) / 2) * 2);

  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Track>(firstTrack);
  const [activeTrack, setActiveTrack] = useState<Track>(firstTrack);
  const [playing, setPlaying] = useState(false);
  const [mechanism, setMechanism] = useState<Mechanism>("idle");
  const [message, setMessage] = useState("PICK A REAL CUT · THEN PRESS PLAY");
  const [volume, setVolume] = useState(0.82);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const leftLetter = pageLetters[page] ?? pageLetters[0] ?? "A";
  const rightLetter = pageLetters[page + 1] ?? "";
  const visibleTracks = tracks.filter((track) =>
    track.code.startsWith(leftLetter) || (rightLetter ? track.code.startsWith(rightLetter) : false),
  );
  const mechanismTrack = playing ? activeTrack : selected;
  const selectedIsActive = selected.code === activeTrack.code;
  const showMusicDock = playing || elapsed > 0;

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const ensureAudioGraph = useCallback(() => {
    if (audioGraphRef.current) return audioGraphRef.current;
    const audio = audioRef.current;
    if (!audio) return null;

    try {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser);
      analyser.connect(context.destination);

      const graph = { context, analyser };
      audioGraphRef.current = graph;
      setAnalyserNode(analyser);
      return graph;
    } catch {
      return null;
    }
  }, []);

  const resumeAudioGraph = useCallback(async () => {
    const graph = ensureAudioGraph();
    if (!graph) return;
    if (graph.context.state === "suspended") await graph.context.resume();
  }, [ensureAudioGraph]);

  const chooseTrack = useCallback((track: Track) => {
    setSelected(track);
    setMessage(`${track.code} SELECTED · ${playing ? "CURRENT SONG KEEPS PLAYING" : "PRESS PLAY"}`);
    if (!playing) setMechanism("idle");
  }, [playing]);

  const startTrack = useCallback(async (track: Track) => {
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
      await resumeAudioGraph();
      await audio.play();
      setPlaying(true);
      await wait(560);
      setMechanism("playing");
      setMessage(`NOW PLAYING · ${track.code}`);
    } catch {
      setPlaying(false);
      setMechanism("idle");
      setMessage("TAP PLAY AGAIN TO START");
    }
  }, [resumeAudioGraph]);

  const startSelected = useCallback(async () => {
    await startTrack(selected);
  }, [selected, startTrack]);

  const toggleActivePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !activeTrack.audio) return;

    if (audio.paused) {
      try {
        await resumeAudioGraph();
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
  }, [activeTrack, resumeAudioGraph]);

  const handleMainPlayButton = useCallback(async () => {
    if (!selectedIsActive) {
      await startSelected();
      return;
    }
    await toggleActivePlayback();
  }, [selectedIsActive, startSelected, toggleActivePlayback]);

  const moveLoaded = useCallback(async (direction: number) => {
    const index = loaded.findIndex((track) => track.code === activeTrack.code);
    const next = loaded[(Math.max(index, 0) + direction + loaded.length) % loaded.length];
    const letterIndex = Math.max(0, pageLetters.indexOf(next.code[0]));
    setPage(Math.floor(letterIndex / 2) * 2);
    await startTrack(next);
  }, [activeTrack.code, loaded, pageLetters, startTrack]);

  const turnPage = useCallback((direction: number) => {
    setPage((current) => Math.min(maxPage, Math.max(0, current + direction * 2)));
    setMessage(playing ? `${activeTrack.code} KEEPS SPINNING · BROWSE AWAY` : "REAL PRESSINGS · PAGE TURNED");
  }, [activeTrack.code, maxPage, playing]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = Math.min(Math.max(seconds, 0), Number.isFinite(audio.duration) ? audio.duration : seconds);
    setElapsed(audio.currentTime);
  }, []);

  const setMessageExternal = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
  }, []);

  return {
    audioRef,
    loaded,
    page,
    maxPage,
    selected,
    activeTrack,
    playing,
    mechanism,
    message,
    volume,
    setVolume,
    elapsed,
    duration,
    analyserNode,
    leftLetter,
    rightLetter,
    visibleTracks,
    mechanismTrack,
    selectedIsActive,
    showMusicDock,
    chooseTrack,
    startTrack,
    startSelected,
    toggleActivePlayback,
    handleMainPlayButton,
    moveLoaded,
    turnPage,
    seekTo,
    setMessage: setMessageExternal,
    audioHandlers: {
      onPlay: () => setPlaying(true),
      onPause: () => setPlaying(false),
      onTimeUpdate: (event: SyntheticEvent<HTMLAudioElement>) => setElapsed(event.currentTarget.currentTime),
      onLoadedMetadata: (event: SyntheticEvent<HTMLAudioElement>) => setDuration(event.currentTarget.duration),
      onDurationChange: (event: SyntheticEvent<HTMLAudioElement>) => setDuration(event.currentTarget.duration),
      onEnded: () => void moveLoaded(1),
      onError: () => {
        setPlaying(false);
        setMechanism("idle");
        setMessage("THE RECORD SKIPPED · TRY AGAIN");
      },
    },
    activeTrackAudio: activeTrack.audio,
  };
}
