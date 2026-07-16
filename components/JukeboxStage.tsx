"use client";

import { Jukebox } from "@/components/jukebox";
import type { Track } from "@/lib/tracks";

interface JukeboxStageProps {
  tracks: Track[];
}

export function JukeboxStage({ tracks }: JukeboxStageProps) {
  return (
    <div className="relative w-full h-full">
      <Jukebox tracks={tracks} />
    </div>
  );
}
