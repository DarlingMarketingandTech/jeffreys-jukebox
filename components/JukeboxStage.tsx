"use client";

import { BarPhilosophy } from "@/components/BarPhilosophy";
import { Jukebox } from "@/components/jukebox";
import { SmokeCanvas } from "@/components/SmokeCanvas";
import { useMood } from "@/lib/mood";
import type { Track } from "@/lib/tracks";

interface JukeboxStageProps {
  tracks: Track[];
}

export function JukeboxStage({ tracks }: JukeboxStageProps) {
  const { smokeDensity } = useMood();

  return (
    <Jukebox
      tracks={tracks}
      atmosphereLayer={
        <SmokeCanvas smokeDensity={smokeDensity} />
      }
      foregroundLayer={
        <BarPhilosophy />
      }
    />
  );
}
