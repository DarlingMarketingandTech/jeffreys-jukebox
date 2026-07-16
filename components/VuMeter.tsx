"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 12;

interface VuMeterProps {
  analyser: AnalyserNode | null;
  playing: boolean;
}

/**
 * Analyser-driven VU strip. Writes scaleY straight to the DOM inside a
 * requestAnimationFrame loop — no React state, no re-renders while playing.
 */
export function VuMeter({ analyser, playing }: VuMeterProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const bars = Array.from(strip.children) as HTMLElement[];

    if (!analyser || !playing) {
      bars.forEach((bar) => { bar.style.transform = "scaleY(0.06)"; });
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    const step = Math.max(1, Math.floor(data.length / BAR_COUNT));

    const tick = () => {
      analyser.getByteFrequencyData(data);
      for (let index = 0; index < bars.length; index += 1) {
        const level = data[Math.min(data.length - 1, index * step)] / 255;
        bars[index].style.transform = `scaleY(${Math.max(0.06, level).toFixed(3)})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [analyser, playing]);

  return (
    <div className="vu-meter" ref={stripRef} aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, index) => <i key={index} />)}
    </div>
  );
}
