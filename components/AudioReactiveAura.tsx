"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 24;

interface AudioReactiveAuraProps {
  analyser: AnalyserNode | null;
  playing: boolean;
}

export function AudioReactiveAura({ analyser, playing }: AudioReactiveAuraProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const bars = Array.from(root.querySelectorAll<HTMLElement>(".ambient-spectrum i"));
    let frame = 0;

    if (!analyser || !playing) {
      root.style.setProperty("--audio-energy", "0");
      root.style.setProperty("--audio-bass", "0");
      bars.forEach((bar) => { bar.style.transform = "scaleY(.04)"; });
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      if (document.hidden) {
        frame = requestAnimationFrame(tick);
        return;
      }

      analyser.getByteFrequencyData(data);

      let total = 0;
      let bass = 0;
      const bassBins = Math.max(2, Math.floor(data.length * 0.12));
      for (let index = 0; index < data.length; index += 1) {
        total += data[index];
        if (index < bassBins) bass += data[index];
      }

      const energy = total / data.length / 255;
      const bassLevel = bass / bassBins / 255;
      root.style.setProperty("--audio-energy", energy.toFixed(3));
      root.style.setProperty("--audio-bass", bassLevel.toFixed(3));

      const step = Math.max(1, Math.floor(data.length / BAR_COUNT));
      bars.forEach((bar, index) => {
        const level = data[Math.min(data.length - 1, index * step)] / 255;
        bar.style.transform = `scaleY(${Math.max(.04, level).toFixed(3)})`;
        bar.style.opacity = `${Math.max(.16, level).toFixed(3)}`;
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [analyser, playing]);

  return (
    <div ref={rootRef} className={`audio-reactive-aura ${playing ? "is-live" : ""}`} aria-hidden="true">
      <div className="ambient-orbit ambient-orbit-one" />
      <div className="ambient-orbit ambient-orbit-two" />
      <div className="ambient-spectrum">
        {Array.from({ length: BAR_COUNT }, (_, index) => <i key={index} />)}
      </div>
    </div>
  );
}
