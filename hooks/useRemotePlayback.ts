"use client";

import { useCallback, useEffect, useState } from "react";

type RemoteState = "connecting" | "connected" | "disconnected";
type RemoteEvent = "connecting" | "connect" | "disconnect";

type RemotePlaybackHandle = {
  state: RemoteState;
  prompt: () => Promise<void>;
  watchAvailability?: (callback: (available: boolean) => void) => Promise<number>;
  cancelWatchAvailability?: (callbackId: number) => void;
  addEventListener: (name: RemoteEvent, listener: EventListener) => void;
  removeEventListener: (name: RemoteEvent, listener: EventListener) => void;
};

type CastableAudio = HTMLAudioElement & { remote?: RemotePlaybackHandle };

export function useRemotePlayback(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const [remoteSupported, setRemoteSupported] = useState(false);
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const [remoteState, setRemoteState] = useState<RemoteState>("disconnected");

  useEffect(() => {
    const audio = audioRef.current as CastableAudio | null;
    const remote = audio?.remote;
    if (!remote) return;

    setRemoteSupported(true);
    setRemoteState(remote.state);
    const syncState = () => setRemoteState(remote.state);
    remote.addEventListener("connecting", syncState);
    remote.addEventListener("connect", syncState);
    remote.addEventListener("disconnect", syncState);

    let watchId: number | undefined;
    void remote.watchAvailability?.((available) => setRemoteAvailable(available))
      .then((id) => { watchId = id; })
      .catch(() => setRemoteAvailable(false));

    return () => {
      remote.removeEventListener("connecting", syncState);
      remote.removeEventListener("connect", syncState);
      remote.removeEventListener("disconnect", syncState);
      if (watchId !== undefined) remote.cancelWatchAvailability?.(watchId);
    };
  }, [audioRef]);

  const promptRemotePlayback = useCallback(async (setMessage: (message: string) => void) => {
    const audio = audioRef.current as CastableAudio | null;
    if (!audio?.remote) return;

    try {
      setMessage("LOOKING FOR A TV OR SPEAKER…");
      await audio.remote.prompt();
      setRemoteState(audio.remote.state);
      setMessage(audio.remote.state === "connected" ? "PLAYING ON YOUR OTHER DEVICE" : "DEVICE PICKER CLOSED");
    } catch {
      setMessage("NO COMPATIBLE PLAYBACK DEVICE FOUND");
    }
  }, [audioRef]);

  return {
    remoteSupported,
    remoteAvailable,
    remoteState,
    promptRemotePlayback,
  };
}
