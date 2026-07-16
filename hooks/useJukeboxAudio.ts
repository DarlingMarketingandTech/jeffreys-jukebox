"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import type { Track } from "@/lib/tracks";
import { playNeedleScratch } from "@/lib/scratchSound";

export type Mechanism = "idle" | "selecting" | "playing" | "paused" | "rejected";
export type Mood = "inside" | "outside";

export type AudioGraph = {
  context: AudioContext;
  analyser: AnalyserNode;
  dryGain: GainNode;
  wetGain: GainNode;
  lowpass: BiquadFilterNode;
};

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
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

interface UseJukeboxAudioOptions {
  tracks: Track[];
  mood: Mood;
  pageLetters: string[];
}

export function useJukeboxAudio({ tracks, mood, pageLetters }: UseJukeboxAudioOptions) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioGraphRef = useRef<AudioGraph | null>(null);

  const loaded = useMemo(() => tracks.filter((track) => track.audio), [tracks]);
  const firstTrack = loaded[0] ?? tracks[0];

  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Track>(firstTrack);
  const [activeTrack, setActiveTrack] = useState<Track>(firstTrack);
  const [playing, setPlaying] = useState(false);
  const [mechanism, setMechanism] = useState<Mechanism>("idle");
  const [message, setMessage] = useState("PICK A TITLE · THEN PRESS PLAY");
  const [volume, setVolume] = useState(0.82);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const leftLetter = pageLetters[page];
  const rightLetter = pageLetters[page + 1];
  const visibleTracks = tracks.filter((track) =>
    track.code.startsWith(leftLetter) || (rightLetter ? track.code.startsWith(rightLetter) : false),
  );
  const mechanismTrack = playing ? activeTrack : selected.audio ? selected : activeTrack;
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

      const graph = { context, analyser, dryGain, wetGain, lowpass };
      audioGraphRef.current = graph;
      setAnalyserNode(analyser);
      return graph;
    } catch {
      return null;
    }
  }, []);

  const applyMoodSound = useCallback(async (nextMood: Mood) => {
    const graph = ensureAudioGraph();
    if (!graph) return;
    if (graph.context.state === "suspended") await graph.context.resume();

    graph.dryGain.gain.setTargetAtTime(nextMood === "outside" ? 0.82 : 1, graph.context.currentTime, 0.08);
    graph.wetGain.gain.setTargetAtTime(nextMood === "outside" ? 0.2 : 0, graph.context.currentTime, 0.08);
    graph.lowpass.frequency.setTargetAtTime(nextMood === "outside" ? 2750 : 5600, graph.context.currentTime, 0.08);
  }, [ensureAudioGraph]);

  const chooseTrack = useCallback((track: Track) => {
    setSelected(track);
    setMessage(track.audio
      ? `${track.code} SELECTED · ${playing ? "CURRENT SONG KEEPS PLAYING" : "PRESS PLAY"}`
      : `${track.code} · TITLE CARD ONLY`);
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
  }, [applyMoodSound, mood]);

  const startSelected = useCallback(async () => {
    if (!selected.audio) {
      setMechanism("rejected");
      setMessage("RECORD SCRATCHED. PICK ANOTHER, JEFF.");
      playNeedleScratch();
      await wait(850);
      setMechanism(playing ? "playing" : "idle");
      setMessage(playing ? `NOW PLAYING · ${activeTrack.code}` : "PICK A TITLE · THEN PRESS PLAY");
      return;
    }
    await startTrack(selected);
  }, [activeTrack.code, playing, selected, startTrack]);

  const toggleActivePlayback = useCallback(async () => {
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
  }, [activeTrack, applyMoodSound, mood]);

  const handleMainPlayButton = useCallback(async () => {
    if (!selected.audio || !selectedIsActive) {
      await startSelected();
      return;
    }
    await toggleActivePlayback();
  }, [selected, selectedIsActive, startSelected, toggleActivePlayback]);

  const moveLoaded = useCallback(async (direction: number) => {
    const index = loaded.findIndex((track) => track.code === activeTrack.code);
    const next = loaded[(Math.max(index, 0) + direction + loaded.length) % loaded.length];
    setPage(Math.floor(pageLetters.indexOf(next.code[0]) / 2) * 2);
    await startTrack(next);
  }, [activeTrack.code, loaded, pageLetters, startTrack]);

  const turnPage = useCallback((direction: number) => {
    setPage((current) => Math.min(10, Math.max(0, current + direction * 2)));
    setMessage(playing ? `${activeTrack.code} KEEPS SPINNING · BROWSE AWAY` : "TITLE PAGES TURNED");
  }, [activeTrack.code, playing]);

  const setMessageExternal = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
  }, []);

  return {
    audioRef,
    loaded,
    page,
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
    applyMoodSound,
    chooseTrack,
    startTrack,
    startSelected,
    toggleActivePlayback,
    handleMainPlayButton,
    moveLoaded,
    turnPage,
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
