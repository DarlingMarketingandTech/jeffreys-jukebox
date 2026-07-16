"use client";

import { useCallback, useRef, useState } from "react";

interface DoorSwitchProps {
  isOutside: boolean;
  onToggle: () => void | Promise<void>;
  className?: string;
  label?: string;
}

export function DoorSwitch({ isOutside, onToggle, className = "", label }: DoorSwitchProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [latching, setLatching] = useState(false);

  const playLatchClick = useCallback(() => {
    try {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;
      if (context.state === "suspended") void context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(1400, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.05);
      gain.gain.setValueAtTime(0.09, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.07);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.08);
    } catch {
      // Audio unavailable — door still swings
    }
  }, []);

  const handleClick = () => {
    setLatching(true);
    playLatchClick();
    window.setTimeout(() => setLatching(false), 220);
    onToggle();
  };

  return (
    <button
      type="button"
      className={`door-switch ${isOutside ? "open" : ""} ${latching ? "latching" : ""} ${className}`.trim()}
      onClick={handleClick}
      aria-label={isOutside ? "Step back inside the bar" : "Step outside into the alley"}
      aria-pressed={isOutside}
    >
      <span className="door-switch-frame" aria-hidden="true">
        <span className="door-switch-panel" />
      </span>
      <span className="door-switch-label">{label ?? (isOutside ? "STEP INSIDE" : "STEP OUTSIDE")}</span>
    </button>
  );
}
