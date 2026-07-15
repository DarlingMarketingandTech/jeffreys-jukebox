"use client";

import { useCallback, useRef, useState } from "react";

interface HazeLighterProps {
  isLit: boolean;
  onToggle: () => void | Promise<void>;
  className?: string;
  label?: string;
}

export function HazeLighter({ isLit, onToggle, className = "", label }: HazeLighterProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [striking, setStriking] = useState(false);

  const playClick = useCallback(() => {
    try {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;
      if (context.state === "suspended") void context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(2800, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(900, context.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.06);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.07);
    } catch {
      // Audio unavailable — haze still toggles
    }
  }, []);

  const handleClick = () => {
    if (!isLit) {
      setStriking(true);
      playClick();
      window.setTimeout(() => setStriking(false), 200);
    }
    onToggle();
  };

  return (
    <button
      type="button"
      className={`haze-lighter ${isLit ? "lit" : ""} ${striking ? "striking" : ""} ${className}`.trim()}
      onClick={handleClick}
      aria-label={isLit ? "Clear the room haze" : "Light one up — ignite the room haze"}
      aria-pressed={isLit}
    >
      <span className="lighter-body" aria-hidden="true">
        <span className="lighter-wheel" />
        <span className={`lighter-flame ${isLit ? "visible" : ""}`} />
      </span>
      <span className="lighter-label">{label ?? (isLit ? "CLEAR AIR" : "LIGHT UP")}</span>
    </button>
  );
}
